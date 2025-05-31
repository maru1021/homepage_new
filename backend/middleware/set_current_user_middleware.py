from fastapi import Request
from backend.models.base_model import current_user_context
from backend.models import get_db
from backend.auth import verify_token

# ユーザー名の取得
async def set_current_user_middleware(request: Request, call_next):
    token = None
    try:
        # アクセストークンを取得
        access_token = request.cookies.get("access_token")
        if access_token:
            # データベースセッションを取得
            db = next(get_db())
            try:
                # ユーザー情報を取得
                user = await verify_token(access_token, db)
                # コンテキストにユーザー情報を設定
                if user:
                    token = current_user_context.set(user)
                    # リクエストのstateにもユーザー情報を設定
                    request.state.user = user
            finally:
                db.close()

        # リクエストを処理
        response = await call_next(request)
        return response
    except Exception as e:
        print('exception in middleware:', str(e))
        response = await call_next(request)
        return response
    finally:
        # コンテキストをリセット
        if token is not None:
            current_user_context.reset(token)