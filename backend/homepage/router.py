from fastapi import APIRouter

from backend.homepage.type.router import router as type_router
from backend.homepage.classification.router import router as classification_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(type_router, prefix="/type", tags=["Type"])
router.include_router(classification_router, prefix="/classification", tags=["Classification"])