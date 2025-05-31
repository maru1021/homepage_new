from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.middleware.set_current_user_middleware import set_current_user_middleware
from backend.auth import router as auth_router
from backend.auth import verify_token
from backend import models
from backend.router import router as main_router
from backend.websocket import router as ws_router
from backend.public_router import router as public_router
from backend.utils.logger import request_context
from backend.general.department.router import router as department_router

app = FastAPI()

# テーブル作成
models.init_db()
models.setup_commit_hooks()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://maruomosquit.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエスト情報を設定するミドルウェア
@app.middleware("http")
async def set_request_context(request, call_next):
    # リクエスト情報をコンテキストに設定
    token = request_context.set(request)
    try:
        response = await call_next(request)
        return response
    finally:
        # コンテキストをクリーンアップ
        request_context.reset(token)

# ユーザー情報を設定するミドルウェアを追加
app.middleware("http")(set_current_user_middleware)

# ルーターの追加順序を変更
app.include_router(public_router, prefix="/public", tags=["Public"])
app.include_router(auth_router, prefix="/auth")
app.include_router(main_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(ws_router, prefix="/ws")
app.include_router(department_router, prefix="/api/general/department", tags=["department"])
