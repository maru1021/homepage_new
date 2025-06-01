import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from backend.api.manufacturing.model.machine_models import Line
from backend.api.manufacturing.line_map import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger

# ラインの変更をWebSocketで通知
async def line_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_line_map)

def run_websocket(db: Session):
    asyncio.run(line_websocket(db))

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


# ライン編集
def update_line_map(db: Session, line_id: int, line_data: schemas.LineMapUpdate, background_tasks: BackgroundTasks):
    try:
        line = db.query(Line).filter(Line.id == line_id).first()
        if not line:
            raise ValueError("ラインが見つかりません。")

        line.position_x = line_data.position_x
        line.position_y = line_data.position_y

        db.commit()
        db.refresh(line)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "ラインを更新しました。",
            "data": {
                "id": line.id,
                "name": line.name,
                "position_x": line.position_x,
                "position_y": line.position_y
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in update_line_map: {str(e)}\n"
            f"Function: update_line_map\n"
            f"Line: {line_data}"
        )
        return {"success": False, "message": "更新に失敗しました", "field": ""}

# ライン削除
def delete_line_map(db: Session, line_id: int, background_tasks: BackgroundTasks):
    try:
        line = db.query(Line).filter(Line.id == line_id).first()
        if not line:
            raise ValueError("ラインが見つかりません。")

        db.delete(line)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "id": line.id,
            "name": line.name,
            "message": "ラインを削除しました。",
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in delete_line: {str(e)}\n"
            f"Function: delete_line\n"
            f"Line ID: {line_id}"
        )
        return {"success": False, "message": "削除に失敗しました", "field": ""}
