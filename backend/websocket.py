import asyncio
import json

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from starlette.websockets import WebSocketState

from backend.auth import SECRET_KEY, ALGORITHM
from backend.models import get_db


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
            message = json.dumps({"updated_data": updated_data, "totalCount": total_count}, default=str)

            try:
                await websocket.send_text(message)
            except Exception:
                self.disconnect(websocket)

websocket_manager = WebSocketManager()

# フロントからWebSocketでデータが来たときに実行
@router.websocket("/{path:path}")
async def websocket_handler(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    await websocket_manager.connect(websocket, token)

    # 30分操作がなければ切断する
    async def timeout_disconnect():
        await asyncio.sleep(30 * 60)
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.close()
        websocket_manager.disconnect(websocket)

    timeout_task = asyncio.create_task(timeout_disconnect())

    try:
        while True:
            raw_data = await websocket.receive_text()

            try:
                data = json.loads(raw_data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
                continue

            # クライアントごとの検索条件を更新
            websocket_manager.active_connections[websocket]["searchQuery"] = data.get("searchQuery", "")
            websocket_manager.active_connections[websocket]["currentPage"] = data.get("currentPage", 1)
            websocket_manager.active_connections[websocket]["itemsPerPage"] = data.get("itemsPerPage", 10)

            # 新しいメッセージを受信したらタイムをリセット
            timeout_task.cancel()
            timeout_task = asyncio.create_task(timeout_disconnect())

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

