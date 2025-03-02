from sqlalchemy import select, desc
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any

from backend.homepage.models import Article


def get_latest_articles(db: Session, limit: int = 100) -> List[Dict[str, Any]]:
    query = (
        select(Article)
        .options(
            joinedload(Article.type),
            joinedload(Article.classification)
        )
        .order_by(desc(Article.updated_at))
    )

    articles = db.execute(query).unique().scalars().all()

    articles_data = [
        {
            "id": article.id,
            "title": article.title,
            "type_name": article.type.name,
            "classification_name": article.classification.name,
            "updated_at": article.updated_at.isoformat(),
            "explanation": article.explanation,
        }
        for article in articles
    ]

    return articles_data
