from fastapi import APIRouter

from backend.authority.router import router as authority_router
from backend.general.router import router as general_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(authority_router, prefix="/authority", tags=["Authority"])
router.include_router(general_router, prefix="/general", tags=["General"])