import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.authority.models import EmployeeAuthority
from backend.general.models import Department
from backend.general.department import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger

# 部署の変更をWebSocketで通知
async def department_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_departments)

def run_websocket(db: Session):
    asyncio.run(department_websocket(db))

# 部署一覧取得
def get_departments(db: Session, search: str = "", page: int = 1, limit: int = 10, return_total_count=True):
    try:
        query = db.query(Department)

        if search:
            query = query.filter(Department.name.contains(search))

        if not return_total_count:
            return query

        total_count = query.count()
        departments = query.offset((page - 1) * limit).limit(limit).all()

        departments_data = {
            "success": True,
            "data": [
                {"id": department.id, "name": department.name} for department in departments
            ]
        }
        return departments_data, total_count
    except Exception as e:
        # 例外情報をログに記録
        logger.write_error_log(
            f"Error in get_departments: {str(e)}\n"
            f"Function: get_departments\n"
            f"Search: {search}\n"
            f"Page: {page}\n"
            f"Limit: {limit}"
        )
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}, 0

# 部署作成
def create_department(db: Session, department: schemas.DepartmentBase, background_tasks: BackgroundTasks):
    try:
        if db.query(Department).filter(Department.name == department.name).first():
            return {"success": False, "message": "その部署は既に存在しています", "field": "name"}

        db_department = Department(name=department.name)
        db.add(db_department)
        max_sort = db.query(func.max(Department.sort)).scalar() or 0
        db_department.sort = max_sort + 1
        db.commit()
        db.refresh(db_department)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "部署を作成しました。",
            "data": {
                "id": db_department.id,
                "name": db_department.name
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in create_department: {str(e)}\n"
            f"Function: create_department\n"
            f"Department: {department}"
        )
        return {"success": False, "message": "部署の登録に失敗しました", "field": ""}

# 部署編集
def update_department(db: Session, department_id: int, department_data: schemas.DepartmentBase, background_tasks: BackgroundTasks):
    try:
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise ValueError("部署が見つかりません。")

        if db.query(Department).filter(Department.name == department_data.name,
                                            Department.id != department_id).first():
            return {"success": False, "message": "その部署は既に存在しています", "field": "name"}

        department.name = department_data.name

        db.commit()
        db.refresh(department)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "部署を更新しました。",
            "data": {
                "id": department.id,
                "name": department.name
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in update_department: {str(e)}\n"
            f"Function: update_department\n"
            f"Department: {department_data}"
        )
        return {"success": False, "message": "更新に失敗しました", "field": ""}

# 部署削除
def delete_department(db: Session, department_id: int, background_tasks: BackgroundTasks):
    try:
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise ValueError("部署が見つかりません。")

        employee_count = db.query(EmployeeAuthority).filter(EmployeeAuthority.department_id == department_id).count()
        if employee_count > 0:
            return {"success": False, "message": "所属している従業員がいるため削除できません", "field": ""}

        db.delete(department)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "id": department.id,
            "name": department.name,
            "message": "部署を削除しました。",
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in delete_department: {str(e)}\n"
            f"Function: delete_department\n"
            f"Department ID: {department_id}"
        )
        return {"success": False, "message": "削除に失敗しました", "field": ""}


# 部署ソート
def sort_departments(db: Session, department_order: list[dict], background_tasks: BackgroundTasks):
    try:
        for department in department_order:
            db.query(Department).filter(Department.id == department['id']).update(
                {"sort": department['sort']}
            )
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "並び替えが完了しました。",
        }

    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in sort_departments: {str(e)}\n"
            f"Function: sort_departments\n"
            f"Department Order: {department_order}"
        )
        return {"success": False, "message": "並べ替えに失敗しました", "field": ""}
