import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from backend.api.manufacturing.model.machine_models import Machine
from backend.api.manufacturing.machine_map import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger

# 機器一覧取得
def get_machine_map(db: Session, line_id: int):
    try:
        machines = db.query(Machine).filter(Machine.active == True, Machine.line_id == line_id)

        machines_data = {
            "success": True,
            "data": [
                {
                    "id": machine.id,
                    "name": machine.name,
                    "operating_condition": machine.operating_condition,
                    "position_x": machine.position_x,
                    "position_y": machine.position_y
                } for machine in machines
            ]
        }

        return machines_data
    except Exception as e:
        logger.write_error_log(
            f"Error in get_machine_map: {str(e)}\n"
            f"Function: get_machine_map"
        )
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}
