from fastapi import APIRouter

from backend.general.department.router import router as department_router
from backend.authority.employee_authority.router import router as authority_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(department_router, prefix="/departments", tags=["Departments"])
router.include_router(authority_router, prefix="/authoritys", tags=["Authoritys"])
