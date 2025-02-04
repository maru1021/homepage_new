from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException
from jose import JWTError, jwt
from backend.auth import SECRET_KEY, ALGORITHM

router = APIRouter()

class WebSocketManager:
    def __init__(self):
        self.active_connections = set()

    async def connect(self, websocket: WebSocket, token: str):
        # トークンの検証
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            websocket.scope["user"] = payload.get("sub")  # ユーザー情報を保存
        except JWTError:
            await websocket.close(code=403)
            raise HTTPException(status_code=403, detail="Invalid token")

        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

websocket_manager = WebSocketManager()

@router.websocket("/departments")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    await websocket_manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket_manager.broadcast(f"受信: {data}")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        print("クライアントが切断されました")
