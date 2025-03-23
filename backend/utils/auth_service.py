# utils/auth_service.py

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session
from backend.auth import get_current_user_or_none
from backend.authority.models import EmployeeAuthority
from backend.general.models import Department


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


# 管理者権限チェック
async def authenticate_and_authorize_admin(request: Request, db: Session):
    current_user = await authenticate_user(request, db)

    # システム部の管理者または一般の管理者権限を確認
    has_admin_access = db.query(EmployeeAuthority).join(
        Department,
        EmployeeAuthority.department_id == Department.id
    ).filter(
        EmployeeAuthority.employee_id == current_user.id,
        EmployeeAuthority.end_date.is_(None),  # 現在有効な権限のみ
        (
            (Department.name == 'システム部') |  # システム部所属
            (EmployeeAuthority.admin == True)    # または管理者権限あり
        )
    ).first() is not None

    if not has_admin_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    return current_user


# アクセス権限チェック
async def authenticate_and_authorize_employee_authority(request: Request, db: Session, target_department_id: int = None):
    current_user = await authenticate_user(request, db)

    # ユーザーの部署権限を取得
    user_authorities = db.query(EmployeeAuthority).filter(
        EmployeeAuthority.employee_id == current_user.id,
        EmployeeAuthority.end_date.is_(None)  # 現在有効な権限のみ
    ).all()

    # 管理者、システム部所属、または管理者権限を持つユーザーは全部署にアクセス可能
    for authority in user_authorities:
        department = db.query(Department).filter(Department.id == authority.department_id).first()
        if department.name in ['管理者'] or authority.admin:
            return current_user

    # GETメソッドとPOSTメソッドの場合は、対象部署の利用者・管理者がアクセス可能
    if request.method in ["GET", "POST"]:
        # 一般ユーザーの場合、自部署のデータのみアクセス可能
        if target_department_id:
            has_department_access = any(
                auth.department_id == target_department_id
                for auth in user_authorities
            )
            if not has_department_access:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="この部署の情報にアクセスする権限がありません"
                )
    else:
        # PUT/DELETEメソッドは管理者のみアクセス可能
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    return current_user