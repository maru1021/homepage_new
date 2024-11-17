from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from . import schemas
from .. import models
from backend.scripts import hash_password


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


def existing_employee(db: Session, employee_no: str):
    return db.query(models.Employee).filter(models.Employee.employee_no == employee_no).first()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    try:
        # トランザクション開始
        if existing_employee(db, employee.employee_no):
            return {"success": False, "message": "従業員番号が重複しています", "field": "employee_no"}

        # パスワードをハッシュ化
        hashed_password = hash_password.hashed_password(employee.password)

        # 新しい従業員を作成
        db_employee = models.Employee(
            name=employee.name,
            employee_no=employee.employee_no,
            password=hashed_password,
        )
        db.add(db_employee)
        db.commit()  # `db_employee` の ID を確定させるためにコミット
        db.refresh(db_employee)

        # forms 情報を中間テーブルに追加
        for form in employee.forms:
            db_employee_department = models.employee_department.insert().values(
                employee_id=db_employee.id,
                department_id=form.department,
                admin=form.admin
            )
            db.execute(db_employee_department)

        # トランザクションのコミット
        db.commit()
        return {"message": "従業員登録に成功しました"}

    except SQLAlchemyError as e:
        # エラーが発生した場合にロールバック
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}
