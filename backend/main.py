from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.auth import router as auth_router
from backend.auth import verify_token
from backend.database import Base, engine
from backend.router import router as main_router
from backend.websocket import router as ws_router
from backend.homepage.router import router as homepage_router


app = FastAPI()

# テーブル作成
Base.metadata.create_all(bind=engine)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://maruomosquit.com",
        "https://www.maruomosquit.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの追加順序を変更
app.include_router(homepage_router, prefix="/homepage", tags=["Homepage"])
app.include_router(auth_router, prefix="/auth")
app.include_router(main_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(ws_router, prefix="/ws")
