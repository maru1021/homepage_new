from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import router
from .auth import router as auth_router
from .websocket import router as ws_router
from backend.general.router import router as general_router
from backend.auth import verify_token

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# テーブル作成
Base.metadata.create_all(bind=engine)

# ルーターの追加
app.include_router(general_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(ws_router, prefix="/ws")
app.include_router(auth_router, prefix="/auth")

