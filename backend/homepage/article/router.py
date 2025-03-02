from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.homepage.article import crud
from backend.database import get_db
from backend.homepage.article import schemas

router = APIRouter()

@router.get("/{id}", response_model=Dict[str, Any])
def read_article(id: int, db: Session = Depends(get_db)):
    article = crud.get_article(db, id)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"article": article}


@router.put("/{id}", response_model=Dict[str, Any])
def update_article(
    id: int,
    article_update: Dict[str, Any],
    db: Session = Depends(get_db)
):
    article = crud.update_article(db, id, article_update)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"article": article}


@router.post("/new", response_model=Dict[str, Any])
def create_article(
    article_data: schemas.ArticleCreate,
    db: Session = Depends(get_db)
):
    article = crud.create_article(db, article_data)
    return {"article": article}


@router.delete("/{id}", response_model=Dict[str, Any])
def delete_article(
    id: int,
    db: Session = Depends(get_db)
):
    result = crud.delete_article(db, id)
    if result is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"success": True}
