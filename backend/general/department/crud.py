import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.authority.models import EmployeeAuthority
from backend.general.models import Department
from backend.general.department import schemas
from backend.websocket import websocket_manager


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

        departments_data = [
                {"id": department.id, "name": department.name} for department in departments
            ]
        return departments_data, total_count
    except SQLAlchemyError as e:
        print(f"Error occurred: {e}")
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}

# 部署作成
def create_department(db: Session, department: schemas.DepartmentBase, background_tasks: BackgroundTasks):
    try:
        if db.query(Department).filter(Department.name == department.name).first():
            return {"success": False, "message": "その部署は既に存在しています", "field": "name"}

        db_department = Department(name=department.name)
        db.add(db_department)
        db.commit()
        db.refresh(db_department)

        background_tasks.add_task(run_websocket, db)

        return { "message": "部署を作成しました。" }
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}

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
            "id": department.id,
            "name": department.name,
            "message": "部署情報を更新しました。",
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"部署更新中にエラーが発生しました: {e}")

# 部署削除
def delete_department(db: Session, department_id: int, background_tasks: BackgroundTasks):
    try:
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise ValueError("部署が見つかりません。")

        employee_count = db.query(EmployeeAuthority).filter(EmployeeAuthority.department_id == department_id).count()
        print(employee_count)
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
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"部署削除中にエラーが発生しました: {e}")
