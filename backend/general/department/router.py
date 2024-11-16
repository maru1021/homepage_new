from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from . import crud, schemas

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedDepartmentResponse)
def read_departments(search: str = Query("", description="Search query"), page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    departments, total_count = crud.get_departments(db, search, page, limit)
    return schemas.PaginatedDepartmentResponse(departments=departments, totalCount=total_count)

@router.post("/", response_model=schemas.DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_employee(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    department_data = department.dict()

    # データベースに新しい従業員を作成
    return crud.create_department(db=db, department=schemas.DepartmentCreate(**department_data))

