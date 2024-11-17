from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import select

from . import schemas
from .. import models
from backend.scripts import hash_password


from sqlalchemy.orm import joinedload
from sqlalchemy.sql import or_

from sqlalchemy.orm import joinedload
from sqlalchemy import or_, and_
from sqlalchemy.sql import func

def get_employees(db: Session, search: str = "", page: int = 1, limit: int = 10):
    # クエリのベース
    query = db.query(models.Employee).options(joinedload(models.Employee.departments))

    if search:
        # 管理者権限検索用の変換
        is_admin = None
        if search == "管理者":
            is_admin = True
        elif search == "利用者":
            is_admin = False

        # 部署名検索クエリ
        department_query = db.query(models.employee_department).join(models.Department).filter(
            models.Department.name.contains(search)
        ).with_entities(models.employee_department.c.employee_id)

        # クエリに条件を追加
        query = query.filter(
            or_(
                models.Employee.name.contains(search),  # 名前で検索
                models.Employee.employee_no.contains(search),  # 社員番号で検索
                models.Employee.id.in_(department_query),  # 部署名で検索
                and_(
                    is_admin is not None,
                    db.query(models.employee_department)
                    .filter(
                        models.employee_department.c.employee_id == models.Employee.id,
                        models.employee_department.c.admin == is_admin
                    ).exists()
                )
            )
        )

    total_count = query.count()  # 検索結果の総件数

    employees = query.offset((page - 1) * limit).limit(limit).all()  # ページネーション処理

    # レスポンス用データ構築
    employees_data = [
        {
            "id": employee.id,
            "employee_no": employee.employee_no,
            "name": employee.name,
            "departments": [
                {
                    "id": dep.id,
                    "name": dep.name,
                    "admin": next(
                        (row.admin for row in db.query(models.employee_department)
                         .filter(
                             models.employee_department.c.employee_id == employee.id,
                             models.employee_department.c.department_id == dep.id
                         ).all()),
                        False
                    )
                }
                for dep in employee.departments
            ]
        }
        for employee in employees
    ]

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


def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeUpdate):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise ValueError("Employee not found")

    # 従業員情報を更新
    employee.name = employee_data.name
    employee.employee_no = employee_data.employee_no

    # 中間テーブルのデータを削除
    db.execute(
        models.employee_department.delete().where(models.employee_department.c.employee_id == employee_id)
    )

    # 新しいデータを挿入
    for form in employee_data.forms:
        db.execute(
            models.employee_department.insert().values(
                employee_id=employee_id,
                department_id=form.department,
                admin=form.admin
            )
        )

    db.commit()
    db.refresh(employee)
    return {"message": "従業員情報を更新しました"}

