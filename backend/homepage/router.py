from fastapi import APIRouter

from backend.homepage.type.router import router as type_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(type_router, prefix="/type", tags=["Type"])
