from fastapi import APIRouter, Depends, status, Query, HTTPException
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


@router.put("/{employee_id}")
async def update_employee(employee_id: int, employee_data: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    from fastapi.exceptions import RequestValidationError
    from fastapi.responses import JSONResponse

    try:
        print(employee_data.dict())  # 受け取ったデータを確認
        return crud.update_employee(db, employee_id, employee_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        print(e.errors())  # バリデーションエラーを出力
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        print(str(e))  # その他の例外を出力
        raise HTTPException(status_code=500, detail="Internal server error")