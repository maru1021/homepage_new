from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.auth import router as auth_router
from backend.auth import verify_token
from backend.database import Base, engine
from backend.router import router as main_router
from backend.websocket import router as ws_router
from backend.scripts.initial_data import create_initial_data


app = FastAPI()

# 初期データ作成
# create_initial_data()

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
app.include_router(main_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(ws_router, prefix="/ws")
app.include_router(auth_router, prefix="/auth")
