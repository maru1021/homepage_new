import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from backend.api.manufacturing.model.machine_models import Line
from backend.api.manufacturing.line_map import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger

# ライン一覧取得
def get_line_map(db: Session):
    try:
        lines = db.query(Line).filter(Line.active == True)

        lines_data = {
            "success": True,
            "data": [
                {
                    "id": line.id,
                    "name": line.name,
                    "position_x": line.position_x,
                    "position_y": line.position_y
                } for line in lines
            ]
        }
        print(lines_data)

        return lines_data
    except Exception as e:
        logger.write_error_log(
            f"Error in get_line_map: {str(e)}\n"
            f"Function: get_line_map"
        )
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}
