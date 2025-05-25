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
        'is_information_system_affairs': False,  # 情報システム室所属
        'is_information_system_affairs_admin': False,  # 情報システム室の管理者
        'department_ids': set(),  # アクセス可能な部署ID
        'admin_department_ids': set()  # 管理者権限を持つ部署ID
    }

    # 部署ごとの権限設定
    department_permissions = {
        '管理者': {'is_system_admin': True},
        '総務部': {'is_general_affairs': True, 'admin_key': 'is_general_affairs_admin'},
        '情報システム室': {'is_information_system_affairs': True, 'admin_key': 'is_information_system_affairs_admin'}
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

        # 部署ごとの権限を設定
        if department.name in department_permissions:
            dept_rules = department_permissions[department.name]
            for key, value in dept_rules.items():
                if key != 'admin_key':
                    permissions[key] = value
                elif authority.admin:
                    permissions[value] = True

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

    # 部署ごとのアクセス制御設定
    department_access_rules = {
        '/general/': {
            'permission_key': 'is_general_affairs',
            'admin_permission_key': 'is_general_affairs_admin'
        },
        '/authority/': {
            'permission_key': 'is_information_system_affairs',
            'admin_permission_key': 'is_information_system_affairs_admin'
        }
    }

    # パスに基づいてアクセス制御を実行
    for path_prefix, rules in department_access_rules.items():
        if path.startswith(path_prefix):
            # 所属チェック
            if not permissions[rules['permission_key']]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"redirect": "/error/404"}
                )

            # メソッドに基づく権限チェック
            if request.method in ["GET", "POST"]:
                return current_user
            elif permissions[rules['admin_permission_key']]:
                return current_user

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"redirect": "/error/404"}
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