import asyncio

from fastapi import BackgroundTasks
from sqlalchemy.orm import joinedload, Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, cast, String

from backend.authority.models import EmployeeAuthority
from backend.general.models import Employee, EmployeeInfo

from backend.general.employee import schemas
from backend.general import models as general_models
from backend.websocket import websocket_manager

# 従業員の変更をWebSocketで通知
async def noti_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_employees)

def run_websocket(db: Session):
    asyncio.run(noti_websocket(db))


def get_employees(db: Session, search: str = "", page: int = 1, limit: int = 10, return_total_count=True):
    from sqlalchemy.orm import aliased
    try:
        employee_info = aliased(EmployeeInfo)

        query = db.query(Employee).options(
            joinedload(Employee.departments),
            joinedload(Employee.info)  # EmployeeInfo を事前にロード
        ).join(employee_info, Employee.id == employee_info.employee_id)

        if search:
            # 部署名で検索
            department_query = db.query(EmployeeAuthority.employee_id).join(
                general_models.Department,
                EmployeeAuthority.department_id == general_models.Department.id
            ).filter(
                general_models.Department.name.contains(search)
            )

            # クエリに条件を追加
            # 日付型は検索前に文字列に変換
            query = query.filter(
                or_(
                    Employee.name.contains(search),
                    Employee.employee_no.contains(search),
                    Employee.email.contains(search),
                    Employee.id.in_(department_query),
                    employee_info.phone_number.contains(search),
                    employee_info.gender.contains(search),
                    employee_info.address.contains(search),
                    employee_info.emergency_contact.contains(search),
                    employee_info.employment_type.contains(search),
                    cast(employee_info.birth_date, String).contains(search),
                    cast(employee_info.hire_date, String).contains(search),
                    cast(employee_info.leave_date, String).contains(search),
                    cast(employee_info.contract_expiration, String).contains(search),
                )
            )
        if not return_total_count:
            return query

        total_count = query.count()

        employees = query.offset((page - 1) * limit).limit(limit).all()  # ページネーション処理

        # レスポンス用データ構築
        employees_data = [
            {
                "id": employee.id,
                "employee_no": employee.employee_no,
                "name": employee.name,
                "email": employee.email,
                "departments": [
                    {"id": dep.id, "name": dep.name} for dep in employee.departments
                ],
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
    except SQLAlchemyError as e:
        print(f"Error occurred: {e}")
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}



def existing_employee(db: Session, employee_no: str):
    return db.query(Employee).filter(Employee.employee_no == employee_no).first()

def create_employee(db: Session, employee: schemas.EmployeeCreate, background_tasks: BackgroundTasks):
    from backend.scripts.init_employee import init_employee

    try:
        if existing_employee(db, employee.employee_no):
            return {"success": False, "message": "従業員番号が重複しています", "field": "employee_no"}

        db_employee = Employee(
            name=employee.name,
            employee_no=employee.employee_no,
            email=employee.email,
        )
        db.add(db_employee)
        db.flush()
        db.refresh(db_employee)

        init_employee(db, db_employee.id)

        db_employee_info = EmployeeInfo(
            employee_id = db_employee.id,
            phone_number = employee.phone_number,
            gender = employee.gender,
            emergency_contact = employee.emergency_contact,
            address = employee.address,
            birth_date = employee.birth_date,
            employment_type = employee.employment_type,
            hire_date = employee.hire_date,
            leave_date = employee.leave_date,
            contract_expiration = employee.contract_expiration
        )

        db.add(db_employee_info)

        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {"message": "従業員登録に成功しました"}

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}


def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeUpdate, background_tasks: BackgroundTasks):
    try:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError("Employee not found")

        employee.name = employee_data.name
        employee.employee_no = employee_data.employee_no
        employee.email = employee_data.email

        employee_info = db.query(EmployeeInfo).filter(EmployeeInfo.employee_id == employee_id).first()

        employee_info.phone_number = employee_data.phone_number
        employee_info.gender = employee_data.gender
        employee_info.address = employee_data.address
        employee_info.emergency_contact = employee_data.emergency_contact
        employee_info.birth_date = employee_data.birth_date if employee_data.birth_date else None
        employee_info.employment_type = employee_data.employment_type
        employee_info.hire_date = employee_data.hire_date if employee_data.hire_date else None
        employee_info.leave_date = employee_data.leave_date if employee_data.leave_date else None
        employee_info.contract_expiration = employee_data.contract_expiration if employee_data.contract_expiration else None

        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {"message": "従業員情報を更新しました"}

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "更新に失敗しました", "field": ""}


def delete_employee(db: Session, employee_id: int, background_tasks: BackgroundTasks):
    try:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            return {"success": False, "message": "対象の従業員が存在しません"}

        db.delete(employee)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {"message": "削除に成功しました。"}
    except Exception as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}
