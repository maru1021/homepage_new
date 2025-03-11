from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.homepage.side_bar import crud, schemas
from backend.models import get_db

router = APIRouter()


@router.get("", response_model=schemas.SideBarResponse, include_in_schema=True)
async def get_side_bar(db: Session = Depends(get_db)):
    return crud.get_side_bar(db)
