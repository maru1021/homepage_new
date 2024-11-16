from fastapi import APIRouter
from backend.general.router import router as general_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(general_router)
