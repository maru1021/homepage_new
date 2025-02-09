from sqlalchemy import text
from datetime import datetime

from backend.general.models import Employee, EmployeeInfo
from backend.authority.models import EmployeeCredential

from backend.auth import hashed_password
from backend.database import SessionLocal


def create_initial_data():

    db = SessionLocal()
    try:
        # 従業員「admin」を追加（id=1）
        admin = Employee(
            id=1,
            employee_no="admin12",
            name="admin",
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        credential = EmployeeCredential(
            employee_id=admin.id,
            hashed_password=hashed_password("password"),
        )
        db.add(credential)

        employee_info = EmployeeInfo(
            employee=admin,
            phone_number="080-1111-1111",
            gender="男性",
            emergency_contact="1111-11-1111",
            address="東京都品川区",
            birth_date=datetime(2025, 11, 11),
            employment_type="正社員",
            hire_date=datetime(2025, 11, 11),
        )
        db.add(employee_info)

        db.execute(text(
            "INSERT INTO departments (id, name) VALUES (1, '未設定') ON CONFLICT (id) DO NOTHING;"
        ))
        db.commit()
    except Exception as e:
        print(f"初期データ作成時のエラー: {e}")
    finally:
        db.close()