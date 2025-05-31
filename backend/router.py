from fastapi import APIRouter

from backend.api.authority.router import router as authority_router
from backend.api.general.router import router as general_router
from backend.homepage.router import router as homepage_router
from backend.api.all.router import router as all_router
from backend.api.manufacturing.router import router as manufacturing_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(homepage_router, prefix="/homepage", tags=["Homepage"])
router.include_router(authority_router, prefix="/authority", tags=["Authority"])
router.include_router(general_router, prefix="/general", tags=["General"])
router.include_router(all_router, prefix="/all", tags=["All"])
router.include_router(manufacturing_router, prefix="/manufacturing", tags=["Manufacturing"])