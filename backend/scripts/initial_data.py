from datetime import datetime

from backend.general.models import Department, Employee, EmployeeInfo
from backend.authority.models import EmployeeAuthority, EmployeeCredential

from backend.auth import hashed_password
from backend.database import SessionLocal


def create_initial_data():
    db = SessionLocal()
    try:
        db.query(EmployeeCredential).delete(synchronize_session=False)
        db.query(EmployeeAuthority).delete(synchronize_session=False)
        db.query(EmployeeInfo).delete(synchronize_session=False)
        db.query(Employee).delete(synchronize_session=False)
        db.query(Department).delete(synchronize_session=False)

        department = Department(
            id=1,
            name = "未設定"
        )
        db.add(department)
        db.flush()

        admin = Employee(
            id=1,
            employee_no="admin12",
            email='test@test.com',
            name="admin",
        )
        db.add(admin)
        db.flush()

        credential = EmployeeCredential(
            employee_id=admin.id,
            hashed_password=hashed_password("password"),
        )
        db.add(credential)

        employee_authority = EmployeeAuthority(
            employee_id = admin.id,
            department_id = department.id,
        )
        db.add(employee_authority)

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
        db.commit()
    except Exception as e:
        print(f"初期データ作成時のエラー: {e}")
    finally:
        db.close()