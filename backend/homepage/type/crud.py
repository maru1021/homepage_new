import asyncio
from fastapi import BackgroundTasks
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.homepage.models import Type
from backend.homepage.type import schemas
from backend.websocket import websocket_manager


# 項目の変更をWebSocketで通知
async def type_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_types)

def run_websocket(db: Session):
    asyncio.run(type_websocket(db))

# 項目一覧取得
def get_types(db: Session, search_query: str = "", current_page: int = 1, items_per_page: int = 10):
    query = db.query(Type)

    if search_query:
        query = query.filter(Type.name.ilike(f"%{search_query}%"))

    query = query.order_by(Type.sort)

    total_count = query.count()

    offset = (current_page - 1) * items_per_page
    types = query.offset(offset).limit(items_per_page).all()

    type_list = []
    for type_obj in types:
        type_dict = {
            "id": type_obj.id,
            "name": type_obj.name,
            "sort": type_obj.sort 
        }
        type_list.append(type_dict)

    return type_list, total_count

# 項目作成
def create_type(db: Session, type: schemas.TypeCreate, background_tasks: BackgroundTasks):
    try:
        if db.query(Type).filter(Type.name == type.name).first():
            return {"success": False, "message": "その項目は既に存在しています", "field": "name"}

        max_sort = db.query(func.max(Type.sort)).scalar() or 0
        next_sort = max_sort + 1

        db_type = Type(
            name=type.name,
            sort=next_sort
        )

        db.add(db_type)
        db.commit()
        db.refresh(db_type)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "項目を作成しました。",
            "field": ""
        }
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}

# 項目編集
def update_type(db: Session, type_id: int, type_data: schemas.Type, background_tasks: BackgroundTasks):
    try:
        type = db.query(Type).filter(Type.id == type_id).first()
        if not type:
            raise ValueError("項目が見つかりません。")

        if db.query(Type).filter(Type.name == type_data.name,
                                            Type.id != type_id).first():
            return {"success": False, "message": "その項目は既に存在しています", "field": "name"}

        type.name = type_data.name

        db.commit()
        db.refresh(type)

        background_tasks.add_task(run_websocket, db)

        return {
            "id": type.id,
            "name": type.name,
            "message": "項目情報を更新しました。",
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"項目更新中にエラーが発生しました: {e}")

# 項目削除
def delete_type(db: Session, type_id: int, background_tasks: BackgroundTasks):
    try:
        type = db.query(Type).filter(Type.id == type_id).first()
        if not type:
            raise ValueError("項目が見つかりません。")

        db.delete(type)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "id": type.id,
            "name": type.name,
            "message": "項目を削除しました。",
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"項目削除中にエラーが発生しました: {e}")
