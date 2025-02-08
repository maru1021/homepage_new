from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.authority.employee import crud, schemas
from backend.authority.employee.excel_operation import export_excel, import_excel
from backend.database import get_db

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedEmployeeResponse)
async def read_employees(search: str = Query("", description="Search query"), page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    employees, total_count = crud.get_employees(db, search, page, limit)
    return schemas.PaginatedEmployeeResponse(employees=employees, totalCount=total_count)


@router.post("/", response_model=schemas.EmployeeResponse)
async def create_employee(employee: schemas.EmployeeCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    employee_data = employee.dict()

    try:
        return crud.create_employee(db=db, employee=schemas.EmployeeCreate(**employee_data), background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{employee_id}", response_model=schemas.EmployeeResponse)
async def update_employee(employee_id: int, employee_data: schemas.EmployeeUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    try:
        return crud.update_employee(db, employee_id, employee_data, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{employee_id}", response_model=schemas.EmployeeResponse)
async def delete_employee(employee_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        return crud.delete_employee(db, employee_id, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


# Excel出力
@router.get("/export_excel")
def export_departments_to_excel(db: Session = Depends(get_db)):
    try:
        return export_excel(db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

# Excel入力
@router.post("/import_excel")
def import_departments_to_excel(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        return import_excel(db, file, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")