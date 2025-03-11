from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.homepage.index import crud
from backend.models import get_db

router = APIRouter()

@router.get("", response_model=Dict[str, List[Dict[str, Any]]])
def read_latest_articles(db: Session = Depends(get_db)):
    articles = crud.get_latest_articles(db)
    return {"articles": articles}
