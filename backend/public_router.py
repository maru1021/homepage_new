from fastapi import APIRouter

from backend.homepage.article.router import router as article_router
from backend.homepage.side_bar.router import router as side_bar_router
from backend.homepage.index.router import router as index_router
from backend.homepage.current_location.router import router as current_location_router



# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(side_bar_router, prefix="/side_bar", tags=["SideBar"])
router.include_router(index_router, prefix="/index", tags=["Index"])
router.include_router(article_router, prefix="/article", tags=["Article"])
router.include_router(current_location_router, prefix="/current_location", tags=["Current Location"])