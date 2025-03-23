from fastapi import APIRouter, BackgroundTasks, Depends, File,  HTTPException, Query, Request, UploadFile
from sqlalchemy.orm import Session

from backend.models import get_db
from backend.general.department import crud, schemas, excel_operation
from backend.utils.auth_service import authenticate_and_authorize_employee_authority


router = APIRouter()

# 部署一覧取得
@router.get("", response_model=schemas.PaginatedDepartmentResponse)
async def read_departments(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", description="SearchQuery"),
    currentPage: int = Query(1, alias="currentPage"),
    itemsPerPage: int = Query(10, alias="itemsPerPage"),
):
    await authenticate_and_authorize_employee_authority(request, db)
    departments, total_count = crud.get_departments(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedDepartmentResponse(departments=departments, totalCount=total_count)


# 部署ソート
@router.post("/sort")
async def sort_departments(
    request: Request,
    department_order: list[dict],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    try:
        return crud.sort_departments(db, department_order, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# 部署作成
@router.post("", response_model=schemas.DepartmentResponse)
async def create_department(
    request: Request,
    department: schemas.DepartmentBase,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    department_data = department.dict()
    return crud.create_department(db=db, department=schemas.DepartmentBase(**department_data), background_tasks=background_tasks )

# 部署編集
@router.put("/{department_id}", response_model=schemas.DepartmentResponse)
async def update_department(
    request: Request,
    department_id: int,
    department_data: schemas.DepartmentBase,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    try:
        return crud.update_department(db, department_id, department_data, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# 部署削除
@router.delete("/{department_id}", response_model=schemas.DepartmentResponse)
async def delete_department(
    request: Request,
    department_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    try:
        return crud.delete_department(db, department_id, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Excel出力
@router.get("/export_excel")
async def export_departments_to_excel(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", alias="searchQuery")
):
    await authenticate_and_authorize_employee_authority(request, db)
    try:
        return excel_operation.export_excel_departments(db, searchQuery)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Excel入力
@router.post("/import_excel")
async def import_departments_to_excel(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    try:
        return excel_operation.import_excel_departments(db, file, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
