import asyncio
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.api.manufacturing.model.machine_models import Line
from backend.api.manufacturing.line import schemas
from backend.websocket import websocket_manager
from backend.utils.logger import logger

# ラインの変更をWebSocketで通知
async def line_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_lines)

def run_websocket(db: Session):
    asyncio.run(line_websocket(db))

# ライン一覧取得
def get_lines(db: Session, search: str = "", page: int = 1, limit: int = 10, return_total_count=True):
    try:
        query = db.query(Line).order_by(Line.sort)

        if search:
            query = query.filter(Line.name.contains(search))

        if not return_total_count:
            return query

        total_count = query.count()
        lines = query.offset((page - 1) * limit).limit(limit).all()

        lines_data = {
            "success": True,
            "data": [
                {
                    "id": line.id,
                    "name": line.name,
                    "active": line.active,
                    "sort": line.sort,
                    "position_x": line.position_x,
                    "position_y": line.position_y,
                } for line in lines
            ]
        }
        return lines_data, total_count
    except Exception as e:
        # 例外情報をログに記録
        logger.write_error_log(
            f"Error in get_lines: {str(e)}\n"
            f"Function: get_lines\n"
            f"Search: {search}\n"
            f"Page: {page}\n"
            f"Limit: {limit}"
        )
        return {"success": False, "message": "情報の取得に失敗しました", "field": ""}, 0

# ライン作成
def create_line(db: Session, line: schemas.LineCreate, background_tasks: BackgroundTasks):
    try:
        if db.query(Line).filter(Line.name == line.name).first():
            return {"success": False, "message": "そのラインは既に存在しています", "field": "name"}

        db_line = Line(name=line.name, active=line.active, position_x=line.position_x, position_y=line.position_y)
        db.add(db_line)
        max_sort = db.query(func.max(Line.sort)).scalar() or 0
        db_line.sort = max_sort + 1
        db.commit()
        db.refresh(db_line)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "ラインを作成しました。",
            "data": {
                "id": db_line.id,
                "name": db_line.name,
                "active": db_line.active
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in create_line: {str(e)}\n"
            f"Function: create_line\n"
            f"Line: {line}"
        )
        return {"success": False, "message": "ラインの登録に失敗しました", "field": ""}

# ライン編集
def update_line(db: Session, line_id: int, line_data: schemas.LineUpdate, background_tasks: BackgroundTasks):
    try:
        line = db.query(Line).filter(Line.id == line_id).first()
        if not line:
            raise ValueError("ラインが見つかりません。")

        if db.query(Line).filter(Line.name == line_data.name,
                                            Line.id != line_id).first():
            return {"success": False, "message": "そのラインは既に存在しています", "field": "name"}

        line.name = line_data.name
        line.active = line_data.active
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
                "active": line.active,
                "position_x": line.position_x,
                "position_y": line.position_y
            }
        }
    except Exception as e:
        db.rollback()
        logger.write_error_log(
            f"Error in update_line: {str(e)}\n"
            f"Function: update_line\n"
            f"Line: {line_data}"
        )
        return {"success": False, "message": "更新に失敗しました", "field": ""}

# ライン削除
def delete_line(db: Session, line_id: int, background_tasks: BackgroundTasks):
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


# ラインソート
def sort_lines(db: Session, line_order: list[dict], background_tasks: BackgroundTasks):
    try:
        for line in line_order:
            db.query(Line).filter(Line.id == line['id']).update(
                {"sort": line['sort']}
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
            f"Error in sort_lines: {str(e)}\n"
            f"Function: sort_lines\n"
            f"Line Order: {line_order}"
        )
        return {"success": False, "message": "並べ替えに失敗しました", "field": ""}

