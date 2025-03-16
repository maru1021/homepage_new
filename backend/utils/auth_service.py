# utils/auth_service.py

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session
from backend.auth import get_current_user_or_none


# 認証関連の処理を提供するサービスクラス
async def authenticate_user(request: Request, db: Session):
    current_user = await get_current_user_or_none(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました。再ログインしてください。"
        )
    return current_user


# ユーザー認証および投稿所有者の確認を行う
async def authenticate_and_authorize_post_owner(request: Request, db: Session, post, admin_override=False):
    current_user = await authenticate_user(request, db)

    # 投稿所有者の確認
    if post.employee_id != current_user.id:
        # 管理者特権が有効で、ユーザーが管理者の場合はスキップ
        if admin_override and getattr(current_user, 'is_admin', False):
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="この投稿を更新する権限がありません"
            )

    return current_user