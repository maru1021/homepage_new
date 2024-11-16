from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from . import crud, schemas

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedEmployeeResponse)
def read_employees(search: str = Query("", description="Search query"), page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    employees, total_count = crud.get_employees(db, search, page, limit)
    return schemas.PaginatedEmployeeResponse(employees=employees, totalCount=total_count)

@router.post("/", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    employee_data = employee.dict()

    # データベースに新しい従業員を作成
    return crud.create_employee(db=db, employee=schemas.EmployeeCreate(**employee_data))

