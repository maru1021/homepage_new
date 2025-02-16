from fastapi import APIRouter, BackgroundTasks, Depends, File,  HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.general.department import crud, schemas, excel_operation


router = APIRouter()

# 部署一覧取得
@router.get("/", response_model=schemas.PaginatedDepartmentResponse)
def read_departments(
    db: Session = Depends(get_db),
    searchQuery: str = Query("", description="SearchQuery"),
    currentPage: int = Query(1, alias="currentPage"),
    itemsPerPage: int = Query(10, alias="itemsPerPage"),
):
    departments, total_count = crud.get_departments(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedDepartmentResponse(departments=departments, totalCount=total_count)

# 部署作成
@router.post("/", response_model=schemas.DepartmentResponse)
def create_department(department: schemas.DepartmentBase, background_tasks: BackgroundTasks, db: Session = Depends(get_db) ):
    department_data = department.dict()
    return crud.create_department(db=db, department=schemas.DepartmentBase(**department_data), background_tasks=background_tasks )

# 部署編集
@router.put("/{department_id}", response_model=schemas.DepartmentResponse)
def update_department(department_id: int, department_data: schemas.DepartmentBase, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        return crud.update_department(db, department_id, department_data, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# 部署削除
@router.delete("/{department_id}", response_model=schemas.DepartmentResponse)
def delete_department(department_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        return crud.delete_department(db, department_id, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Excel出力
@router.get("/export_excel")
def export_departments_to_excel(db: Session = Depends(get_db), searchQuery: str = Query("", alias="searchQuery")):
    try:
        return excel_operation.export_excel_departments(db, searchQuery)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Excel入力
@router.post("/import_excel")
def import_departments_to_excel(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        return excel_operation.import_excel_departments(db, file, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
