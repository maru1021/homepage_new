import asyncio
from fastapi import BackgroundTasks
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.homepage.models import Type, Classification
from backend.homepage.classification import schemas
from backend.websocket import websocket_manager


# 項目の変更をWebSocketで通知
async def classification_websocket(db: Session):
    await websocket_manager.broadcast_filtered(db, get_classifications)

def run_websocket(db: Session):
    asyncio.run(classification_websocket(db))

# 項目一覧取得
def get_classifications(db: Session, search_query: str = "", current_page: int = 1, items_per_page: int = 10):
    query = db.query(Classification).join(Type).filter(Type.id == Classification.type_id)

    if search_query:
        # 分類名またはタイプ名で検索
        query = query.filter(
            (Classification.name.ilike(f"%{search_query}%")) |  # 分類名で検索
            (Type.name.ilike(f"%{search_query}%"))  # タイプ名で検索
        )

    query = query.order_by(Classification.sort)

    total_count = query.count()

    offset = (current_page - 1) * items_per_page
    classifications = query.offset(offset).limit(items_per_page).all()

    classification_list = [
        {
            "id": classification_obj.id,
            "name": classification_obj.name,
            "sort": classification_obj.sort,
            "type_id": classification_obj.type_id,
            "type_name": classification_obj.type.name
        } for classification_obj in classifications
    ]

    return classification_list, total_count

# 項目作成
def create_classification(db: Session, classification: schemas.ClassificationCreate, background_tasks: BackgroundTasks):
    try:
        if db.query(Classification).filter(Classification.name == classification.name).first():
            return {"success": False, "message": "その分類は既に存在しています", "field": "name"}

        max_sort = db.query(func.max(Classification.sort)).scalar() or 0
        next_sort = max_sort + 1

        db_classification = Classification(
            name=classification.name,
            sort=next_sort,
            type_id=classification.type_id
        )

        db.add(db_classification)
        db.commit()
        db.refresh(db_classification)

        background_tasks.add_task(run_websocket, db)

        return {
            "success": True,
            "message": "分類を作成しました。",
            "field": ""
        }
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error occurred: {e}")
        return {"success": False, "message": "データベースエラーが発生しました", "field": ""}

# 項目編集
def update_classification(db: Session, classification_id: int, classification_data: schemas.ClassificationUpdate, background_tasks: BackgroundTasks):
    try:
        classification = db.query(Classification).filter(Classification.id == classification_id).first()
        if not classification:
            raise ValueError("分類が見つかりません。")

        if db.query(Classification).filter(Classification.name == classification_data.name,
                                            Classification.id != classification_id).first():
            return {"success": False, "message": "その分類は既に存在しています", "field": "name"}

        classification.name = classification_data.name
        classification.type_id = classification_data.type_id

        db.commit()
        db.refresh(classification)

        background_tasks.add_task(run_websocket, db)

        return {
            "id": classification.id,
            "name": classification.name,
            "message": "分類情報を更新しました。",
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"分類更新中にエラーが発生しました: {e}")

# 項目削除
def delete_classification(db: Session, classification_id: int, background_tasks: BackgroundTasks):
    try:
        classification = db.query(Classification).filter(Classification.id == classification_id).first()
        if not classification:
            raise ValueError("分類が見つかりません。")

        db.delete(classification)
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "id": classification.id,
            "name": classification.name,
            "message": "分類を削除しました。",
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"項目削除中にエラーが発生しました: {e}")

# 項目並び替え
def sort_classifications(db: Session, classification_order: list[dict], background_tasks: BackgroundTasks) -> dict:
    try:
        for classification in classification_order:
            db.query(Classification).filter(Classification.id == classification['id']).update(
                {"sort": classification['sort']}
            )
        db.commit()

        background_tasks.add_task(run_websocket, db)

        return {
            "message": "項目並び替えが完了しました。",
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError(f"Failed to reorder types: {str(e)}")