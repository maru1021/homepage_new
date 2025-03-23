from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security.utils import get_authorization_scheme_param
from typing import Dict, Optional, List, Any

import jwt
from jwt import PyJWTError
from sqlalchemy.orm import Session, join

from backend.authority.models import EmployeeCredential, UserSession, EmployeeAuthority
from backend.general.models import Employee
from backend.models import get_db
from scripts.get_time import now
from scripts.hash_password import verify_password, hashed_password

# 環境変数から取得することを推奨
SECRET_KEY = "your_secret_key"  # 本番環境では環境変数から取得
ALGORITHM = "HS256"
JST = ZoneInfo("Asia/Tokyo")
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # アクセストークンの有効期限（分）
REFRESH_TOKEN_EXPIRE_DAYS = 7  # リフレッシュトークンの有効期限（日）

router = APIRouter()

# カスタムOAuth2スキーム（Cookieと認証ヘッダーの両方をサポート）
class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: Optional[str] = None,
        scopes: Optional[Dict[str, str]] = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)

        # まずヘッダーからトークンを取得
        if scheme.lower() == "bearer":
            return param

        # ヘッダーになければCookieを確認
        access_token = request.cookies.get("access_token")
        if access_token:
            return access_token

        if self.auto_error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="認証情報が見つかりません",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None

# OAuth2スキームの設定
oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="auth/token")

# ユーザー認証
def authenticate_user(db: Session, employee_no: str, password: str):
    employee = (db.query(Employee)
                .outerjoin(EmployeeCredential)
                .filter(Employee.employee_no == employee_no)
                .first())

    if not employee or not employee.credential:
        return False

    if not verify_password(password, employee.credential.hashed_password):
        return False

    return employee

# アクセストークン作成
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = now() + expires_delta
    else:
        expire = now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "token_type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt, expire

# リフレッシュトークン作成
def create_refresh_token(data: dict, db: Session):
    user_id = data["user_id"]
    jti = str(uuid.uuid4())  # ユニークなトークンID

    # 有効期限を設定
    expire = now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # 既存のリフレッシュトークンがあれば無効化
    db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.is_active == True
    ).update({"is_active": False})

    # 新しいセッションを作成
    new_session = UserSession(
        user_id=user_id,
        jti=jti,
        expires_at=expire,
        is_active=True,
        created_at=now()
    )

    db.add(new_session)
    db.commit()

    # リフレッシュトークンをエンコード
    to_encode = {
        "sub": data["sub"],
        "user_id": user_id,
        "jti": jti,
        "exp": expire,
        "token_type": "refresh"
    }

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt, expire

# トークン検証
async def verify_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証情報が無効です",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # トークンをデコード
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        employee_no = payload.get("sub")
        user_id = payload.get("user_id")
        token_type = payload.get("token_type")

        if employee_no is None or user_id is None:
            raise credentials_exception

        # アクセストークンかを確認
        if token_type != "access":
            raise credentials_exception

        # トークンの有効期限を確認
        exp = payload.get("exp")
        if exp is None or datetime.fromtimestamp(exp, JST) < now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="トークンの有効期限が切れています",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 従業員情報を取得
        employee = (db.query(Employee)
                   .filter(Employee.employee_no == employee_no,
                           Employee.id == user_id)
                   .first())

        if employee is None:
            raise credentials_exception

        return employee

    except PyJWTError:
        raise credentials_exception

# リフレッシュトークンの検証と新しいアクセストークンの発行
@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="リフレッシュトークンが見つかりません",
        )

    try:
        # リフレッシュトークンをデコード
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        employee_no = payload.get("sub")
        user_id = payload.get("user_id")
        jti = payload.get("jti")
        token_type = payload.get("token_type")

        # リフレッシュトークンかを確認
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="無効なトークンタイプです",
            )

        # データベースでセッションを確認
        session = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.jti == jti,
            UserSession.is_active == True,
            UserSession.expires_at > now()
        ).first()

        if not session:
            # セッションが無効か期限切れ
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="セッションが無効か期限切れです",
            )

        # 新しいアクセストークンを作成
        new_access_token, expiration_time = create_access_token(
            data={"sub": employee_no, "user_id": user_id}
        )

        # クッキーにアクセストークンを設定
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=True,  # HTTPS環境では必ずTrueに
            samesite="strict",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expiration_time": expiration_time
        }

    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なリフレッシュトークンです",
        )

# 認証エラーハンドラ
async def get_current_user_or_none(request: Request, db: Session = Depends(get_db)):
    try:
        # CookieからJWTトークンを取得
        access_token = request.cookies.get("access_token")
        if not access_token:
            return None

        user = await verify_token(access_token, db)
        return user
    except:
        return None

# トークン発行エンドポイント
@router.post("/token")
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    employee = authenticate_user(db, form_data.username, form_data.password)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="社員番号またはパスワードが間違っています",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # アクセストークンを作成
    access_token, access_expiration = create_access_token(
        data={"sub": employee.employee_no, "user_id": employee.id}
    )

    # リフレッシュトークンを作成
    refresh_token, refresh_expiration = create_refresh_token(
        data={"sub": employee.employee_no, "user_id": employee.id},
        db=db
    )

    # HTTPOnlyクッキーにトークンを設定
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # HTTPS環境では必ずTrueに
        samesite="strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # HTTPS環境では必ずTrueに
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    # フロントエンド用の非機密情報を含むレスポンス
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expiration_time": access_expiration,
        "user_id": employee.id,
        "employee_no": employee.employee_no,
        "name": employee.name
    }

# ログアウトエンドポイント
@router.post("/logout")
async def logout(
    response: Response,
    current_user: Employee = Depends(verify_token),
    db: Session = Depends(get_db)
):
    # ユーザーのアクティブなセッションを無効化
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).update({"is_active": False})

    db.commit()

    # クッキーを削除
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return {"detail": "ログアウトしました"}

# 現在のユーザー情報を取得
@router.get("/me")
async def get_current_user(current_user: Employee = Depends(verify_token), db: Session = Depends(get_db)):
    # 部署情報を取得
    authorities = db.query(EmployeeAuthority).filter(
        EmployeeAuthority.employee_id == current_user.id,
        EmployeeAuthority.end_date.is_(None)  # 現在有効な部署のみ
    ).all()

    departments = []
    is_system_admin = False
    for auth in authorities:
        departments.append({
            "id": auth.department_id,
            "name": auth.department.name,
            "admin": auth.admin
        })
        # システム部の管理者かどうかをチェック
        if auth.department.name == "システム部" and auth.admin:
            is_system_admin = True

    return {
        "id": current_user.id,
        "employee_no": current_user.employee_no,
        "name": current_user.name,
        "departments": departments,
        "is_system_admin": is_system_admin
    }