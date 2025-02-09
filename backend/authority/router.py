from fastapi import APIRouter

from backend.authority.employee_authority.router import router as authority_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(authority_router, prefix="/employee_authority", tags=["EmployeeAuthoritys"])
