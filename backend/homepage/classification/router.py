from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.homepage.classification import crud, schemas
from backend.database import get_db

router = APIRouter()

@router.get("", response_model=schemas.PaginatedClassificationResponse)
async def read_classifications(
    db: Session = Depends(get_db),
    searchQuery: str = Query(""),
    currentPage: int = Query(1),
    itemsPerPage: int = Query(10),
):
    classifications, total_count = crud.get_classifications(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedClassificationResponse(classifications=classifications, totalCount=total_count)


@router.post("", response_model=schemas.ClassificationResponse)
async def create_classification(classification: schemas.ClassificationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    classification_data = classification.dict()

    try:
        return crud.create_classification(db=db, classification=schemas.ClassificationCreate(**classification_data), background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{classification_id}", response_model=schemas.ClassificationResponse)
async def update_classification(classification_id: int, classification_data: schemas.ClassificationUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    try:
        return crud.update_classification(db, classification_id, classification_data, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{classification_id}", response_model=schemas.ClassificationResponse)
async def delete_classification(classification_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        return crud.delete_classification(db, classification_id, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RequestValidationError as e:
        raise JSONResponse(status_code=422, content={"detail": e.errors()})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

