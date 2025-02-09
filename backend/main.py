from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from backend.auth import router as auth_router
from backend.auth import verify_token, hashed_password
from backend.database import Base, engine, SessionLocal
from backend.general.router import router as general_router
from backend.websocket import router as ws_router
from backend.scripts.get_time import today


app = FastAPI()

# 起動時に実行
# @app.on_event("startup")
# def create_default_department():
#     from backend.general.models import Employee
#     from backend.authority.models import EmployeeCredentials
#     db = SessionLocal()
#     try:
#         # 従業員「admin」を追加（id=1）
#         admin = Employee(
#             id=1,
#             employee_no="admin12",
#             name="admin",
#             employment_type="正社員",
#         )

#         db.add(admin)
#         db.commit()
#         db.refresh(admin)

#         new_credentials = EmployeeCredentials(
#             employee_id=admin.id,
#             hashed_password=hashed_password("password"),
#         )
#         db.add(new_credentials)

#         db.execute(text(
#             "INSERT INTO departments (id, name) VALUES (1, '未設定') ON CONFLICT (id) DO NOTHING;"
#         ))
#         db.commit()
#     except Exception as e:
#         print(f"初期データ作成時のエラー: {e}")
#     finally:
#         db.close()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# テーブル作成
Base.metadata.create_all(bind=engine)

# ルーターの追加
app.include_router(general_router, prefix="/api", dependencies=[Depends(verify_token)])
app.include_router(ws_router, prefix="/ws")
app.include_router(auth_router, prefix="/auth")
