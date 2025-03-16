from fastapi import APIRouter

from backend.all.bulletin_board.router import router as bulletin_board_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(bulletin_board_router, prefix="/bulletin_board", tags=["Bulletin Board"])
