from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.api.manufacturing.line.router import router as line_router
from backend.utils.auth_service import authenticate_and_authorize_employee_authority
from backend.models import get_db

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(line_router, prefix="/line", tags=["Line"])

@router.get("/auth_check")
async def auth_check(request: Request, db: Session = Depends(get_db)):
    await authenticate_and_authorize_employee_authority(request, db)
    return {"message": "Authentication successful"}