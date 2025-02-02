from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import delete, or_, and_, exists

from . import schemas
from .. import models
from backend.general import models as general_models
from backend.scripts import hash_password


def get_employees(db: Session, search: str = "", page: int = 1, limit: int = 10):
    query = db.query(models.Employee).options(joinedload(models.Employee.departments))

    if search:
        # 管理者権限検索用の変換
        is_admin = None
        if search == "管理者":
            is_admin = True
        elif search == "利用者":
            is_admin = False

        # 部署名で検索
        department_query = db.query(models.EmployeeAuthority.employee_id).join(
            general_models.Department,
            models.EmployeeAuthority.department_id == general_models.Department.id
        ).filter(
            general_models.Department.name.contains(search)
        )

        # クエリに条件を追加
        query = query.filter(
            or_(
                models.Employee.name.contains(search),  # 名前で検索
                models.Employee.employee_no.contains(search),  # 社員番号で検索
                models.Employee.id.in_(department_query),  # 部署名で検索
                and_(
                    is_admin is not None,
                    exists().where(
                        and_(
                            models.EmployeeAuthority.employee_id == models.Employee.id,
                            models.EmployeeAuthority.admin == is_admin
                        )
                    )
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
                        (row.admin for row in db.query(models.EmployeeAuthority)
                         .filter(
                             models.EmployeeAuthority.employee_id == employee.id,
                             models.EmployeeAuthority.department_id == dep.id
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
        # 従業員番号の重複チェック
        if existing_employee(db, employee.employee_no):
            return {"success": False, "message": "従業員番号が重複しています", "field": "employee_no"}

        # パスワードをハッシュ化
        hashed_password = hash_password.hashed_password(employee.password)

        # 新しい従業員を作成
        db_employee = models.Employee(
            name=employee.name,
            employee_no=employee.employee_no,
            email=employee.email,
            hashed_password=hashed_password,
        )
        db.add(db_employee)
        db.flush()
        db.refresh(db_employee)

        # 部署・権限情報を中間テーブルに保存
        employee_authorities = [
            models.EmployeeAuthority(
                employee_id=db_employee.id,
                department_id=form.department,
                admin=form.admin,
            )
            for form in employee.forms
        ]

        db.bulk_save_objects(employee_authorities)
        db.commit()
        return {"message": "従業員登録に成功しました"}

    except SQLAlchemyError as e:
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
    stmt = delete(models.EmployeeAuthority).where(models.EmployeeAuthority.employee_id == employee_id)
    db.execute(stmt)

    # 部署・権限情報を中間テーブルに保存
    employee_authorities = [
        models.EmployeeAuthority(
            employee_id=employee_id,
            department_id=form.department,
            admin=form.admin,
        )
        for form in employee_data.forms
    ]

    db.bulk_save_objects(employee_authorities)

    db.commit()
    return {"message": "従業員情報を更新しました"}


def delete_employee(db: Session, employee_id: int):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        return {"success": False, "message": "対象の従業員が存在しません"}

    try:
        print('test')
        db.delete(employee)
        print('test2')
        db.commit()
        print('test3')

        return {"message": "削除に成功しました。"}
    except Exception as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}
