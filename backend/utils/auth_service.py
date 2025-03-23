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


# ユーザーの権限情報を取得
def get_user_permissions(user_authorities, db: Session):
    permissions = {
        'is_system_admin': False,  # 管理者部署所属
        'is_general_affairs': False,  # 総務部所属
        'is_general_affairs_admin': False,  # 総務部の管理者
        'department_ids': set(),  # アクセス可能な部署ID
        'admin_department_ids': set()  # 管理者権限を持つ部署ID
    }

    for authority in user_authorities:
        department = db.query(Department).filter(Department.id == authority.department_id).first()
        if not department:
            continue

        # 部署IDを記録
        permissions['department_ids'].add(authority.department_id)

        # 管理者権限を持つ部署を記録
        if authority.admin:
            permissions['admin_department_ids'].add(authority.department_id)

        # 管理者部署所属チェック
        if department.name == '管理者':
            permissions['is_system_admin'] = True

        # 総務部所属チェック
        if department.name == '総務部':
            permissions['is_general_affairs'] = True
            if authority.admin:
                permissions['is_general_affairs_admin'] = True

    return permissions


# アクセス権限チェック
async def authenticate_and_authorize_employee_authority(request: Request, db: Session, target_department_id: int = None):
    current_user = await authenticate_user(request, db)

    # ユーザーの部署権限を取得
    user_authorities = db.query(EmployeeAuthority).filter(
        EmployeeAuthority.employee_id == current_user.id,
        EmployeeAuthority.end_date.is_(None)  # 現在有効な権限のみ
    ).all()

    # 権限情報を取得
    permissions = get_user_permissions(user_authorities, db)

    # 管理者部署所属の場合は全てのアクセスを許可
    if permissions['is_system_admin']:
        return current_user

    # URLパスを取得し、/api/を除去
    path = request.url.path.lower().replace('/api/', '/')

    # 総務部関連のパスかチェック
    is_general_path = any(path.startswith(prefix) for prefix in ['/general/', '/authority/'])

    # 総務部関連のパスへのアクセス
    if is_general_path:
        # 総務部所属者または管理者でない場合はアクセス拒否
        if not permissions['is_general_affairs']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "総務部所属者のみがアクセスできます",
                    "redirect": "/error/404"
                }
            )

        # 総務部所属者はGET/POSTが可能
        if request.method in ["GET", "POST"]:
            return current_user
        # 総務部管理者はPUT/DELETEも可能
        elif permissions['is_general_affairs_admin']:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "この操作を実行する権限がありません",
                "redirect": "/error/404"
            }
        )

    # その他のパスへのアクセス（特定の部署に関連する操作）
    if target_department_id:
        # 自部署へのアクセスチェック
        if target_department_id not in permissions['department_ids']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "この部署の情報にアクセスする権限がありません",
                    "redirect": "/error/404"
                }
            )

        # GET/POSTは部署所属者なら可能
        if request.method in ["GET", "POST"]:
            return current_user

        # PUT/DELETEは部署の管理者のみ可能
        if target_department_id in permissions['admin_department_ids']:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "この操作を実行する権限がありません",
                "redirect": "/error/404"
            }
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