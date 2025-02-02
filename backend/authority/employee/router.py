from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from . import crud, schemas
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedEmployeeResponse)
async def read_employees(search: str = Query("", description="Search query"), page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    employees, total_count = crud.get_employees(db, search, page, limit)
    return schemas.PaginatedEmployeeResponse(employees=employees, totalCount=total_count)


@router.post("/", response_model=schemas.EmployeeResponse)
async def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    employee_data = employee.dict()

    try:
        return crud.create_employee(db=db, employee=schemas.EmployeeCreate(**employee_data))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{employee_id}", response_model=schemas.EmployeeResponse)
async def update_employee(employee_id: int, employee_data: schemas.EmployeeUpdate, db: Session = Depends(get_db)):

    try:
        return crud.update_employee(db, employee_id, employee_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{employee_id}", response_model=schemas.EmployeeResponse)
async def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    try:
        print('pppppppppppppppp')
        return crud.delete_employee(db, employee_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")