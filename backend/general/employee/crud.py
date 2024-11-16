from sqlalchemy.orm import Session

from . import schemas
from .. import models
from backend.scripts import hash_password

def existing_employee(db: Session, employee_no: str):
    return db.query(models.Employee).filter(models.Employee.employee_no == employee_no).first()

def get_employees(db: Session, search: str = "", page: int = 1, limit: int = 10):
    query = db.query(models.Employee)

    if search:
        query = query.filter(
            (models.Employee.name.contains(search)) |
            (models.Employee.employee_no.contains(search))
        )

    total_count = query.count()  # 検索結果の総件数
    employees = query.offset((page - 1) * limit).limit(limit).all()  # ページネーション処理

    employees_data = [schemas.Employee.from_orm(employee) for employee in employees]

    return employees_data, total_count

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    if existing_employee(db, employee.employee_no):
        return {"success": False, "message": "従業員番号が重複しています", "field": "employee_no"}

    # パスワードをハッシュ化
    hashed_password = hash_password.hashed_password(employee.password)

    db_employee = models.Employee(
        name=employee.name,
        employee_no=employee.employee_no,
        password=hashed_password,
        admin=employee.admin
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return {"message": "従業員登録に成功しました"}

