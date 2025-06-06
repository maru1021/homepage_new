import asyncio

from fastapi import BackgroundTasks
from sqlalchemy.orm import joinedload, Session
from sqlalchemy import delete, exists, or_, and_

from backend.api.authority.models import EmployeeAuthority
from backend.api.general.models import Employee, Department

from backend.scripts.validations.existing_employee import existing_employee
from backend.api.authority.employee_authority import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger


# 従業員の変更をWebSocketで通知
async def noti_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_employees)

def run_websocket(db: Session):
    asyncio.run(noti_websocket(db))


def get_employees(db: Session, search: str = "", page: int = 1, limit: int = 10, department_id: int = None, return_total_count=True):
    query = db.query(Employee).options(joinedload(Employee.departments))

    try:
        if search:
            # 管理者権限検索用の変換
            is_admin = None
            if search == "管理者":
                is_admin = True
            elif search == "利用者":
                is_admin = False

            # 部署名で検索
            department_query = db.query(EmployeeAuthority.employee_id).join(
                Department,
                EmployeeAuthority.department_id == Department.id
            ).filter(
                Department.name.contains(search)
            )

            # クエリに条件を追加
            query = query.filter(
                or_(
                    Employee.name.contains(search),  # 名前で検索
                    Employee.employee_no.contains(search),  # 社員番号で検索
                    Employee.id.in_(department_query),  # 部署名で検索
                    and_(
                        is_admin is not None,
                        exists().where(
                            and_(
                                EmployeeAuthority.employee_id == Employee.id,
                                EmployeeAuthority.admin == is_admin
                            )
                        )
                    )
                )
            )

            # 検索結果が0件の場合は空のリストを返す
            if query.count() == 0:
                return [], 0

        # 部署IDによるフィルタリング
        if department_id:
            department_employees = db.query(EmployeeAuthority.employee_id).filter(
                EmployeeAuthority.department_id == department_id,
                EmployeeAuthority.end_date.is_(None)  # 現在有効な権限のみ
            )
            query = query.filter(Employee.id.in_(department_employees))

            # 部署フィルタリング結果が0件の場合は空のリストを返す
            if query.count() == 0:
                return [], 0

        if not return_total_count:
            return query

        total_count = query.count()  # 検索結果の総件数

        # 検索結果が0件の場合は空のリストを返す
        if total_count == 0:
            return [], 0

        employees = query.offset((page - 1) * limit).limit(limit).all()

        # レスポンス用データ構築
        employees_data = {
            "success": True,
            "data": [
                {
                    "id": employee.id,
                    "employee_no": employee.employee_no,
                    "name": employee.name,
                    "email": employee.email,
                    "departments": [
                        {
                            "id": dep.id,
                            "name": dep.name,
                            "admin": next(
                                (row.admin for row in db.query(EmployeeAuthority)
                                .filter(
                                    EmployeeAuthority.employee_id == employee.id,
                                    EmployeeAuthority.department_id == dep.id
                                ).all()),
                                False
                            )
                        }
                        for dep in employee.departments
                    ]
                }
            for employee in employees
            ]
        }

        return employees_data, total_count
    except Exception as e:
        logger.write_error_log(
            f"Error in get_employees: {str(e)}\n"
            f"Function: get_employees\n"
            f"Search: {search}\n"
            f"Page: {page}\n"
            f"Limit: {limit}"
        )
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}, 0

def create_employee(db: Session, employee: schemas.EmployeeCreate, background_tasks: BackgroundTasks):
    from backend.scripts.init_employee import init_employee
    try:
        # 従業員番号の重複チェック
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

        # 初期化処理
        init_employee(db, db_employee.id, employee.forms)

        db.commit()

        background_tasks.add_task(run_websocket, db)
        return {"success": True, "message": "従業員権限の登録に成功しました"}

    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in create_employee: {str(e)}\n"
            f"Function: create_employee\n"
            f"Employee: {employee}"
        )
        return {"success": False, "message": "従業員権限の登録に失敗しました", "field": ""}


def update_employee(db: Session, employee_id: int, employee_data: schemas.EmployeeUpdate, background_tasks: BackgroundTasks):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if existing_employee(db, employee_data.employee_no, employee.id):
        return {"success": False, "message": "従業員番号が重複しています", "field": "employee_no"}
    try:
        if not employee:
            raise ValueError("Employee not found")

        # 従業員情報を更新
        employee.name = employee_data.name
        employee.employee_no = employee_data.employee_no

        # 中間テーブルのデータを削除
        stmt = delete(EmployeeAuthority).where(EmployeeAuthority.employee_id == employee_id)
        db.execute(stmt)

        # 部署・権限情報を中間テーブルに保存
        employee_authorities = [
            EmployeeAuthority(
                employee_id=employee_id,
                department_id=form.department,
                admin=form.admin,
            )
            for form in employee_data.forms
        ]

        db.bulk_save_objects(employee_authorities)

        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {"message": "従業員情報を更新しました"}
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in update_employee: {str(e)}\n"
            f"Function: update_employee\n"
            f"Employee: {employee}"
        )
        return {"success": False, "message": "従業員権限の更新に失敗しました", "field": ""}


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
        logger.write_error_log(
            f"Error in delete_employee: {str(e)}\n"
            f"Function: delete_employee\n"
            f"Employee: {employee}"
        )
        return {"success": False, "message": "従業員権限の削除に失敗しました", "field": ""}
