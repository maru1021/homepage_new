from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, Request, UploadFile
from sqlalchemy.orm import Session

from backend.models import get_db
from backend.api.manufacturing.line_map import crud, schemas
from backend.utils.auth_service import authenticate_and_authorize_employee_authority


router = APIRouter()

# ライン一覧取得
@router.get("", response_model=schemas.LineMapResponse)
async def read_line_map(
    request: Request,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.get_line_map(db)

