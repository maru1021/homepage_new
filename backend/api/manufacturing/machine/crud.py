import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.api.manufacturing.model.machine_models import Machine, Line
from backend.api.manufacturing.machine import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger
from sqlalchemy.orm import joinedload
from sqlalchemy import or_

# ラインの変更をWebSocketで通知
async def machine_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_machines)

def run_websocket(db: Session):
    asyncio.run(machine_websocket(db))

# 設備一覧取得
def get_machines(db: Session, search: str = "", page: int = 1, limit: int = 10, return_total_count=True):
    try:
        query = db.query(Machine).options(joinedload(Machine.line))

        if search:
            query = query.filter(
                or_(
                    Machine.name.contains(search),
                    Line.name.contains(search)
                )
            )

        if not return_total_count:
            return query

        total_count = query.count()
        machines = query.offset((page - 1) * limit).limit(limit).all()

        machines_data = {
            "success": True,
            "data": [
                {
                    "id": machine.id,
                    "name": machine.name,
                    "active": machine.active,
                    "position_x": machine.position_x,
                    "position_y": machine.position_y,
                    "sort": machine.sort,
                    "operating_condition": machine.operating_condition,
                    "line_id": machine.line.id if machine.line else None,
                    "line_name": machine.line.name if machine.line else None,
                    "line": {
                        "id": machine.line.id,
                        "name": machine.line.name
                    } if machine.line else None
                } for machine in machines
            ]
        }
        return machines_data, total_count
    except Exception as e:
        # 例外情報をログに記録
        logger.write_error_log(
            f"Error in get_machines: {str(e)}\n"
            f"Function: get_machines\n"
            f"Search: {search}\n"
            f"Page: {page}\n"
            f"Limit: {limit}"
        )
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}, 0

# 設備作成
def create_machine(db: Session, machine: schemas.MachineCreate, background_tasks: BackgroundTasks):
    try:
        # 有効な設備の場合のみ、同じ名前の設備がライン内に存在するかチェック
        if machine.active:
            query = db.query(Machine).filter(Machine.name == machine.name, Machine.active == True)
            if machine.line_id:
                # ラインが指定されている場合は、同じライン内でチェック
                query = query.filter(Machine.line_id == machine.line_id)
            else:
                # ラインが指定されていない場合は、ラインが未設定の設備とチェック
                query = query.filter(Machine.line_id.is_(None))
            if query.first():
                return {"success": False, "message": "その設備は既に存在しています", "field": "name"}

        # ラインの取得
        line = None
        if machine.line_id:
            line = db.query(Line).filter(Line.id == machine.line_id).first()

        db_machine = Machine(
            name=machine.name,
            active=machine.active,
            line_id=machine.line_id if line else None
        )
        db.add(db_machine)
        max_sort = db.query(func.max(Machine.sort)).scalar() or 0
        db_machine.sort = max_sort + 1
        db.commit()
        db.refresh(db_machine)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "設備を作成しました。",
            "data": {
                "id": db_machine.id,
                "name": db_machine.name,
                "active": db_machine.active,
                "sort": db_machine.sort,
                "position_x": db_machine.position_x,
                "position_y": db_machine.position_y,
                "operating_condition": db_machine.operating_condition,
                "line_id": db_machine.line_id,
                "line_name": line.name if line else None,
                "line": {
                    "id": line.id,
                    "name": line.name
                } if line else None
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in create_machine: {str(e)}\n"
            f"Function: create_machine\n"
            f"Machine: {machine}"
        )
        return {"success": False, "message": "設備の登録に失敗しました", "field": ""}

# ライン編集
def update_machine(db: Session, machine_id: int, machine_data: schemas.MachineUpdate, background_tasks: BackgroundTasks):
    try:
        machine = db.query(Machine).filter(Machine.id == machine_id).first()
        if not machine:
            raise ValueError("設備が見つかりません。")

        # 有効な設備の場合のみ、同じ名前の設備がライン内に存在するかチェック
        if machine_data.active:
            query = db.query(Machine).filter(
                Machine.name == machine_data.name,
                Machine.active == True,
                Machine.id != machine_id
            )
            if machine_data.line_id:
                # ラインが指定されている場合は、同じライン内でチェック
                query = query.filter(Machine.line_id == machine_data.line_id)
            else:
                # ラインが指定されていない場合は、ラインが未設定の設備とチェック
                query = query.filter(Machine.line_id.is_(None))
            if query.first():
                return {"success": False, "message": "その設備は既に存在しています", "field": "name"}

        # ラインの取得
        line = None
        if machine_data.line_id:
            line = db.query(Line).filter(Line.id == machine_data.line_id).first()

        machine.name = machine_data.name
        machine.active = machine_data.active
        machine.line_id = machine_data.line_id if line else None
        machine.position_x = machine_data.position_x
        machine.position_y = machine_data.position_y
        machine.operating_condition = machine_data.operating_condition
        db.commit()
        db.refresh(machine)
        print('-------------------------------')
        print(machine.operating_condition)
        print('-------------------------------')

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "設備を更新しました。",
            "data": {
                "id": machine.id,
                "name": machine.name,
                "active": machine.active,
                "position_x": machine.position_x,
                "position_y": machine.position_y,
                "sort": machine.sort,
                "operating_condition": machine.operating_condition,
                "line_id": machine.line_id,
                "line_name": line.name if line else None,
                "line": {
                    "id": line.id,
                    "name": line.name
                } if line else None
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in update_machine: {str(e)}\n"
            f"Function: update_machine\n"
            f"Machine: {machine_data}"
        )
        return {"success": False, "message": "更新に失敗しました", "field": ""}

# 設備削除
def delete_machine(db: Session, machine_id: int, background_tasks: BackgroundTasks):
    try:
        machine = db.query(Machine).filter(Machine.id == machine_id).first()
        if not machine:
            raise ValueError("設備が見つかりません。")

        db.delete(machine)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "id": machine.id,
            "name": machine.name,
            "message": "設備を削除しました。",
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in delete_machine: {str(e)}\n"
            f"Function: delete_machine\n"
            f"Machine ID: {machine_id}"
        )
        return {"success": False, "message": "削除に失敗しました", "field": ""}


# 設備ソート
def sort_machines(db: Session, machine_order: list[dict], background_tasks: BackgroundTasks):
    try:
        for machine in machine_order:
            db.query(Machine).filter(Machine.id == machine['id']).update(
                {"sort": machine['sort']}
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
            f"Error in sort_machines: {str(e)}\n"
            f"Function: sort_machines\n"
            f"Machine Order: {machine_order}"
        )
        return {"success": False, "message": "並べ替えに失敗しました", "field": ""}
