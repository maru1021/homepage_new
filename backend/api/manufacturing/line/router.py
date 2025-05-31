from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, Request, UploadFile
from sqlalchemy.orm import Session

from backend.models import get_db
from backend.api.manufacturing.line import crud, schemas, excel_operation
from backend.utils.auth_service import authenticate_and_authorize_employee_authority


router = APIRouter()

# ライン一覧取得
@router.get("", response_model=schemas.PaginatedLineResponse)
async def read_lines(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", description="SearchQuery"),
    currentPage: int = Query(1, alias="currentPage"),
    itemsPerPage: int = Query(10, alias="itemsPerPage"),
):
    await authenticate_and_authorize_employee_authority(request, db)
    lines, total_count = crud.get_lines(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedLineResponse(lines=lines, totalCount=total_count)


# ラインソート
@router.post("/sort")
async def sort_lines(
    request: Request,
    line_order: list[dict],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.sort_lines(db, line_order, background_tasks=background_tasks)

# ライン作成
@router.post("", response_model=schemas.LineResponse)
async def create_line(
    request: Request,
    line: schemas.LineBase,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    line_data = line.dict()
    return crud.create_line(db=db, line=schemas.LineBase(**line_data), background_tasks=background_tasks )

# ライン編集
@router.put("/{line_id}", response_model=schemas.LineResponse)
async def update_line(
    request: Request,
    line_id: int,
    line_data: schemas.LineBase,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.update_line(db, line_id, line_data, background_tasks=background_tasks)

# ライン削除
@router.delete("/{line_id}", response_model=schemas.LineResponse)
async def delete_line(
    request: Request,
    line_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.delete_line(db, line_id, background_tasks=background_tasks)

# Excel出力
@router.get("/export_excel")
async def export_lines_to_excel(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", alias="searchQuery")
):
    await authenticate_and_authorize_employee_authority(request, db)
    return excel_operation.export_excel_lines(db, searchQuery)

# Excel入力
@router.post("/import_excel")
async def import_lines_to_excel(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return excel_operation.import_excel_lines(db, file, background_tasks=background_tasks)