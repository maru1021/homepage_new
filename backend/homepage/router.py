from fastapi import APIRouter

from backend.homepage.type.router import router as type_router
from backend.homepage.classification.router import router as classification_router
from backend.homepage.index.router import router as index_router


# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(type_router, prefix="/type", tags=["Type"])
router.include_router(classification_router, prefix="/classification", tags=["Classification"])
router.include_router(index_router, prefix="/index", tags=["Index"])

