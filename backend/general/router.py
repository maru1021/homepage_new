from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.general.department.router import router as department_router
from backend.general.employee.router import router as employee_router
from backend.utils.auth_service import authenticate_and_authorize_employee_authority
from backend.models import get_db

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(department_router, prefix="/department", tags=["Department"])
router.include_router(employee_router, prefix="/employee", tags=["Employee"])

@router.get("/auth_check")
async def auth_check(request: Request, db: Session = Depends(get_db)):
    await authenticate_and_authorize_employee_authority(request, db)
    return {"message": "Authentication successful"}
