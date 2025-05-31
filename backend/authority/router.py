from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.authority.employee_authority.router import router as authority_router
from backend.utils.auth_service import authenticate_and_authorize_employee_authority
from backend.models import get_db

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(authority_router, prefix="/employee_authority", tags=["EmployeeAuthoritys"])

@router.get("/auth_check")
async def auth_check(request: Request, db: Session = Depends(get_db)):
    await authenticate_and_authorize_employee_authority(request, db)
    return {"message": "Authentication successful"}