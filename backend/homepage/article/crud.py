from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from typing import Dict, Any
from datetime import datetime

from backend.homepage.models import Article
from backend.homepage.article import schemas


# 項目一覧取得
def get_article(db: Session, id: int):
    query = (
        select(Article)
        .options(
            joinedload(Article.type),
            joinedload(Article.classification)
        )
        .where(Article.id == id)
    )

    article = db.execute(query).unique().scalar_one_or_none()

    if article is None:
        return None

    return {
        "id": article.id,
        "title": article.title,
        "disp": article.disp if article.disp else None,
        "language": article.language,
        "code": article.code if article.code else None,
        "language2": article.language2,
        "code2": article.code2 if article.code2 else None,
        "language3": article.language3,
        "code3": article.code3 if article.code3 else None,
        "explanation": article.explanation if article.explanation else None,
        "type_name": article.type.name if article.type else None,
        "classification_name": article.classification.name if article.classification else None,
        "updated_at": article.updated_at.isoformat() if article.updated_at else None,
    }

def update_article(db: Session, id: int, update_data: Dict[str, Any]):
    article = db.query(Article).filter(Article.id == id).first()
    if article is None:
        return None

    # 更新データに現在時刻を追加
    update_data['updated_at'] = datetime.now()

    for key, value in update_data.items():
        setattr(article, key, value)

    db.commit()
    db.refresh(article)

    return get_article(db, id)

def create_article(db: Session, article_data: schemas.ArticleCreate):
    # 最大のsort値を取得
    max_sort = db.query(func.max(Article.sort)).scalar() or 0

    # dictに変換する前にsort値を設定
    article_dict = article_data.dict()
    article_dict['sort'] = max_sort + 1

    article = Article(**article_dict)
    db.add(article)
    db.commit()
    db.refresh(article)
    return get_article(db, article.id)

def delete_article(db: Session, id: int):
    article = db.query(Article).filter(Article.id == id).first()
    if article is None:
        return None

    db.delete(article)
    db.commit()
    return True
