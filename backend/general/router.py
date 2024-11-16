from fastapi import APIRouter
from backend.general.department.router import router as department_router
from backend.general.employee.router import router as employee_router

# APIRouterのインスタンスを作成
router = APIRouter()

# 各モジュールのルーターを統合
router.include_router(department_router, prefix="/departments", tags=["Departments"])
router.include_router(employee_router, prefix="/employees", tags=["Employees"])
