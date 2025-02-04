from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi import FastAPI
from backend.general.router import router as general_router
from backend.auth import verify_token

# APIRouterのインスタンスを作成
router = APIRouter()
app = FastAPI(redoc_url=None, redirect_slashes=False)

# APIルーター全体に認証を適用
api_router = APIRouter(
    dependencies=[Depends(verify_token)]
)

# 各モジュールのルーターを統合
router.include_router(general_router)
