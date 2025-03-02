import asyncio
from sqlalchemy.orm import Session, joinedload

from backend.homepage.models import Type, Classification


def get_side_bar(db: Session):
    types = db.query(Type)\
        .options(
            joinedload(Type.classifications)
            .joinedload(Classification.articles)
        )\
        .order_by(Type.sort)\
        .all()

    return {
        "types": [
            {
                "id": type_obj.id,
                "name": type_obj.name,
                "classifications": [
                    {
                        "id": classification.id,
                        "name": classification.name,
                        "articles": [
                            {
                                "id": article.id,
                                "title": article.title
                            }
                            for article in sorted(classification.articles, key=lambda x: x.sort)
                        ]
                    }
                    for classification in sorted(type_obj.classifications, key=lambda x: x.sort)
                ]
            }
            for type_obj in types
        ]
    }