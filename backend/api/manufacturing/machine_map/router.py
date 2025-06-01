from fastapi import APIRouter, BackgroundTasks, Depends, Request
from sqlalchemy.orm import Session

from backend.models import get_db
from backend.api.manufacturing.machine_map import crud, schemas
from backend.utils.auth_service import authenticate_and_authorize_employee_authority


router = APIRouter()

# 機器一覧取得
@router.get("/{line_id}", response_model=schemas.MachineMapResponse)
async def read_machine_map(
    request: Request,
    line_id: int,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.get_machine_map(db, line_id)
