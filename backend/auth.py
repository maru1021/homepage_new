from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from jwt import PyJWTError
from sqlalchemy.orm import Session, join

from backend.authority.models import EmployeeCredential
from backend.general.models import Employee
from backend.database import get_db
from scripts.get_time import now
from scripts.hash_password import verify_password, hashed_password


SECRET_KEY = "your_secret_key"  # 本番環境では環境変数から取得
ALGORITHM = "HS256"
JST = ZoneInfo("Asia/Tokyo")
EXPIRES_DELTA = 120 #ログアウトされるまでの時間(分単位)

# OAuth2スキームの設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter()

# ユーザー認証
def authenticate_user(db: Session, employee_no: str, password: str):
    employee = (db.query(Employee)
                .outerjoin(EmployeeCredential)
                .filter(Employee.employee_no == employee_no)
                .first())

    if not employee or not verify_password(password, employee.credential.hashed_password):
        return False
    return employee

# アクセストークン作成
def create_access_token(data: dict):
    expires_delta = timedelta(minutes=EXPIRES_DELTA)
    to_encode = data.copy()
    expiration_time = now() + expires_delta
    to_encode.update({"exp": expiration_time})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM), expiration_time

# トークン検証
def verify_token(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        # トークンをデコード
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # トークンの有効期限を確認
        exp = payload.get("exp")
        if exp is None or datetime.fromtimestamp(exp, JST) < now():
            raise HTTPException(status_code=401, detail="Token expired")

        # トークンが有効ならユーザー情報を返す
        return payload

    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# トークン発行エンドポイント
@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="社員番号またはパスワードが間違っています")

    access_token, expiration_time = create_access_token(
        data={"sub": user.employee_no}
    )
    return {"access_token": access_token, "token_type": "bearer", "expiration_time": expiration_time}
