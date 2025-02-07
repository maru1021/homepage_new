from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, Depends
from jose import JWTError, jwt
from backend.auth import SECRET_KEY, ALGORITHM
import json
from backend.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

class WebSocketManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, token: str):
        # トークンの検証
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            websocket.scope["user"] = payload.get("sub")  # ユーザー情報を保存
        except JWTError:
            await websocket.close(code=403)
            raise HTTPException(status_code=403, detail="Invalid token")

        await websocket.accept()
        self.active_connections[websocket] = {
            "searchQuery": "",
            "currentPage": 1,
            "itemsPerPage": 10
        }

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_filtered(self, db: Session, get_func):
        for websocket, filters in self.active_connections.items():
            search_query = filters["searchQuery"]
            current_page = filters["currentPage"]
            items_per_page = filters["itemsPerPage"]

            updated_data, total_count = get_func(db, search_query, current_page, items_per_page)
            message = json.dumps({"updated_data": updated_data, "totalCount": total_count})

            try:
                await websocket.send_text(message)
            except Exception:
                self.disconnect(websocket)

websocket_manager = WebSocketManager()

@router.websocket("/departments")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    from backend.general.department.crud import get_departments
    await websocket_manager.connect(websocket, token)

    try:
        while True:
            raw_data = await websocket.receive_text()

            if not raw_data.strip():
                continue  # 空メッセージは無視

            try:
                data = json.loads(raw_data)  # JSONデコード
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
                continue

            # 🔹 クライアントごとの検索条件を更新
            websocket_manager.active_connections[websocket]["searchQuery"] = data.get("searchQuery", "")
            websocket_manager.active_connections[websocket]["currentPage"] = data.get("currentPage", 1)
            websocket_manager.active_connections[websocket]["itemsPerPage"] = data.get("itemsPerPage", 10)

            # 🔹 個別のクライアントにフィルタリングされたデータを送信
            search_query = websocket_manager.active_connections[websocket]["searchQuery"]
            current_page = websocket_manager.active_connections[websocket]["currentPage"]
            items_per_page = websocket_manager.active_connections[websocket]["itemsPerPage"]

            departments, total_count = get_departments(db, search_query, current_page, items_per_page)
            response_message = json.dumps({"updated_data": departments, "totalCount": total_count})
            await websocket.send_text(response_message)

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

