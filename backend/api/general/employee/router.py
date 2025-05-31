from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, Request, UploadFile
from sqlalchemy.orm import Session

from backend.api.general.employee import crud, schemas, excel_operation
from backend.models import get_db
from backend.utils.auth_service import authenticate_and_authorize_employee_authority

router = APIRouter()

@router.get("", response_model=schemas.PaginatedEmployeeResponse)
async def read_employees(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query(""),
    currentPage: int = Query(1),
    itemsPerPage: int = Query(10),
):
    await authenticate_and_authorize_employee_authority(request, db)
    employees, total_count = crud.get_employees(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedEmployeeResponse(employees=employees, totalCount=total_count)


@router.post("", response_model=schemas.EmployeeResponse)
async def create_employee(
    request: Request,
    employee: schemas.EmployeeCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    await authenticate_and_authorize_employee_authority(request, db)
    employee_data = employee.dict()
    return crud.create_employee(db=db, employee=schemas.EmployeeCreate(**employee_data), background_tasks=background_tasks)


@router.put("/{employee_id}", response_model=schemas.EmployeeResponse)
async def update_employee(
    request: Request,
    employee_id: int,
    employee_data: schemas.EmployeeUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.update_employee(db, employee_id, employee_data, background_tasks=background_tasks)


@router.delete("/{employee_id}", response_model=schemas.EmployeeResponse)
async def delete_employee(
    request: Request,
    employee_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.delete_employee(db, employee_id, background_tasks=background_tasks)


# Excel出力
@router.get("/export_excel")
async def export_employees_to_excel(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", alias="searchQuery"),
):
    await authenticate_and_authorize_employee_authority(request, db)
    return excel_operation.export_excel_employees(db, searchQuery)


# Excel入力
@router.post("/import_excel")
async def import_employees_to_excel(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    await authenticate_and_authorize_employee_authority(request, db)
    return excel_operation.import_excel_employees(db, file, background_tasks=background_tasks)
