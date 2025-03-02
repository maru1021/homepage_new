from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.homepage.type import crud, schemas
from backend.database import get_db

router = APIRouter()

@router.get("/", response_model=schemas.PaginatedTypeResponse)
async def read_types(
    db: Session = Depends(get_db),
    searchQuery: str = Query(""),
    currentPage: int = Query(1),
    itemsPerPage: int = Query(10),
):
    types, total_count = crud.get_types(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedTypeResponse(types=types, totalCount=total_count)


@router.post("/", response_model=schemas.TypeResponse)
async def create_type(type: schemas.TypeCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    type_data = type.dict()

    try:
        return crud.create_type(db=db, type=schemas.TypeCreate(**type_data), background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{type_id}", response_model=schemas.TypeResponse)
async def update_type(type_id: int, type_data: schemas.TypeUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    try:
        return crud.update_type(db, type_id, type_data, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{type_id}", response_model=schemas.TypeResponse)
async def delete_type(type_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        return crud.delete_type(db, type_id, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/hierarchy", response_model=schemas.TypeHierarchyResponse)
async def get_type_hierarchy(db: Session = Depends(get_db)):
    return crud.get_type_hierarchy(db)
