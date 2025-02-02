from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from .database import engine, Base
from . import router
from .auth import router as auth_router
from fastapi.routing import APIRouter

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ReactのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# テーブル作成
Base.metadata.create_all(bind=engine)

# OAuth2認証スキーム
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# トークンを検証する関数
def verify_token(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

# APIルーター全体に認証を適用
api_router = APIRouter(
    dependencies=[Depends(verify_token)]
)

# ルーターの追加
app.include_router(router.router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(auth_router, prefix="/auth")

