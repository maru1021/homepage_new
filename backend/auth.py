from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Union
from backend.authority.models import Employee
from database import get_db
from scripts.hash_password import verify_password, hashed_password

# 秘密鍵とアルゴリズム設定
SECRET_KEY = "your_secret_key"  # 本番環境では環境変数から取得
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2スキームの設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# FastAPI のルーター設定
router = APIRouter()

# ユーザー認証関数（employee_no で認証）
def authenticate_user(db: Session, employee_no: str, password: str):
    employee = db.query(Employee).filter(Employee.employee_no == employee_no).first()
    # 初期ユーザー作成
    if employee_no=="maru123" and password=="password" and not employee:
        employee = Employee(
            employee_no="maru123",
            name="maru",
            email="",
            hashed_password=hashed_password("password")
        )

        db.add(employee)
        db.commit()
        db.refresh(employee)

        return employee
    if not employee or not verify_password(password, employee.hashed_password):
        return False
    return employee

# アクセストークン作成関数
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# トークン発行エンドポイント
@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="社員番号またはパスワードが間違っています")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.employee_no}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
