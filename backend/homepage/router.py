from fastapi import APIRouter

from backend.homepage.type.router import router as type_router
from backend.homepage.classification.router import router as classification_router
from backend.homepage.index.router import router as index_router
from backend.homepage.article.router import router as article_router
from backend.homepage.side_bar.router import router as side_bar_router


# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(type_router, prefix="/type", tags=["Type"])
router.include_router(classification_router, prefix="/classification", tags=["Classification"])
router.include_router(index_router, prefix="/index", tags=["Index"])
router.include_router(article_router, prefix="/article", tags=["Article"])
router.include_router(side_bar_router, prefix="/side_bar", tags=["SideBar"])