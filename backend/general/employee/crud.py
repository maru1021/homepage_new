import asyncio

from fastapi import BackgroundTasks
from sqlalchemy.orm import joinedload, Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import delete, exists, or_, and_

from backend.authority.models import EmployeeAuthority
from backend.general.models import Employee
from backend.authority.employee_authority import schemas
from backend.general import models as general_models
from backend.scripts import hash_password
from backend.websocket import websocket_manager

# 従業員の変更をWebSocketで通知
async def noti_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_employees)

def run_websocket(db: Session):
    asyncio.run(noti_websocket(db))


def get_employees(db: Session, search: str = "", page: int = 1, limit: int = 10, return_total_count=True):
    query = db.query(Employee).options(
        joinedload(Employee.departments),
        joinedload(Employee.info)  # EmployeeInfo を事前にロード
    )

    if search:
        # 部署名で検索
        department_query = db.query(EmployeeAuthority.employee_id).join(
            general_models.Department,
            EmployeeAuthority.department_id == general_models.Department.id
        ).filter(
            general_models.Department.name.contains(search)
        )

        # クエリに条件を追加
        query = query.filter(
            or_(
                Employee.name.contains(search),
                Employee.employee_no.contains(search),
                Employee.id.in_(department_query),
            )
        )

    if return_total_count == False:
        return query

    total_count = query.count()  # 検索結果の総件数

    employees = query.offset((page - 1) * limit).limit(limit).all()  # ページネーション処理
    print(employees)

    # レスポンス用データ構築
    employees_data = [
        {
            "id": employee.id,
            "employee_no": employee.employee_no,
            "name": employee.name,
            "departments": [dep.name for dep in employee.departments],  # 部署名のみ
            "info": {
                "phone_number": employee.info.phone_number if employee.info else None,
                "gender": employee.info.gender if employee.info else None,
                "emergency_contact": employee.info.emergency_contact if employee.info else None,
                "address": employee.info.address if employee.info else None,
                "birth_date": employee.info.birth_date if employee.info else None,
                "employment_type": employee.info.employment_type if employee.info else None,
                "hire_date": employee.info.hire_date if employee.info else None,
                "leave_date": employee.info.leave_date if employee.info else None,
                "contract_expiration": employee.info.contract_expiration if employee.info else None,
            } if employee.info else None
        }
        for employee in employees
    ]

    return employees_data, total_count



def existing_employee(db: Session, employee_no: str):
    return db.query(Employee).filter(Employee.employee_no == employee_no).first()

def create_employee(db: Session, employee: schemas.EmployeeCreate, background_tasks: BackgroundTasks):
    from backend.authority.models import EmployeeCredential
    try:
        # 従業員番号の重複チェック
        if existing_employee(db, employee.employee_no):
            return {"success": False, "message": "従業員番号が重複しています", "field": "employee_no"}

        # 新しい従業員を作成
        db_employee = Employee(
            name=employee.name,
            employee_no=employee.employee_no,
            email=employee.email,
        )
        db.add(db_employee)
        db.flush()
        db.refresh(db_employee)

        # 認証情報を保存
        hashed_password = hash_password.hashed_password("password")
        employee_credential = EmployeeCredential(
            employee_id=db_employee.id,
            hashed_password=hashed_password
        )
        db.add(employee_credential)

        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {"message": "従業員登録に成功しました"}

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}


def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeUpdate, background_tasks: BackgroundTasks):
    print('test')
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise ValueError("Employee not found")

    employee.name = employee_data.name
    employee.employee_no = employee_data.employee_no

    db.commit()

    background_tasks.add_task(run_websocket, db)

    return {"message": "従業員情報を更新しました"}


def delete_employee(db: Session, employee_id: int, background_tasks: BackgroundTasks):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        return {"success": False, "message": "対象の従業員が存在しません"}

    try:
        db.delete(employee)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {"message": "削除に成功しました。"}
    except Exception as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}
