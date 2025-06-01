from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, Request, UploadFile
from sqlalchemy.orm import Session

from backend.models import get_db
from backend.api.manufacturing.machine import crud, schemas, excel_operation
from backend.utils.auth_service import authenticate_and_authorize_employee_authority


router = APIRouter()

# 設備一覧取得
@router.get("", response_model=schemas.PaginatedMachineResponse)
async def read_machines(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", description="SearchQuery"),
    currentPage: int = Query(1, alias="currentPage"),
    itemsPerPage: int = Query(10, alias="itemsPerPage"),
):
    await authenticate_and_authorize_employee_authority(request, db)
    machines, total_count = crud.get_machines(db, searchQuery, currentPage, itemsPerPage)
    return schemas.PaginatedMachineResponse(machines=machines, totalCount=total_count)


# 設備ソート
@router.post("/sort")
async def sort_machines(
    request: Request,
    machine_order: list[dict],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.sort_machines(db, machine_order, background_tasks=background_tasks)

# 設備作成
@router.post("", response_model=schemas.MachineResponse)
async def create_machine(
    request: Request,
    machine: schemas.MachineCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    machine_data = machine.dict()
    return crud.create_machine(db=db, machine=schemas.MachineBase(**machine_data), background_tasks=background_tasks )

# 設備編集
@router.put("/{machine_id}", response_model=schemas.MachineResponse)
async def update_machine(
    request: Request,
    machine_id: int,
    machine_data: schemas.MachineUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.update_machine(db, machine_id, machine_data, background_tasks=background_tasks)

# 設備削除
@router.delete("/{machine_id}", response_model=schemas.MachineResponse)
async def delete_machine(
    request: Request,
    machine_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    await authenticate_and_authorize_employee_authority(request, db)
    return crud.delete_machine(db, machine_id, background_tasks=background_tasks)

# Excel出力
@router.get("/export_excel")
async def export_machines_to_excel(
    request: Request,
    db: Session = Depends(get_db),
    searchQuery: str = Query("", alias="searchQuery")
):
    await authenticate_and_authorize_employee_authority(request, db)
    return excel_operation.export_excel_machines(db, searchQuery)

# Excel入力
# @router.post("/import_excel")
# async def import_machines_to_excel(
#     request: Request,
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     await authenticate_and_authorize_employee_authority(request, db)
#     return excel_operation.import_excel_machines(db, file, background_tasks=background_tasks)