from pydantic import BaseModel
from typing import List, Optional, Union

# ラインの基本情報
class Line(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class MachineBase(BaseModel):
    name: str
    active: bool = True
    searchQuery: Optional[str] = None
    line_id: Optional[int] = None

class MachineCreate(MachineBase):
    pass

class MachineUpdate(MachineBase):
    operating_condition: str
    position_x: int
    position_y: int
    pass

# テーブルのデータ取得時の形式
class Machine(BaseModel):
    id: int
    name: str
    active: bool
    sort: int
    position_x: int
    position_y: int
    line: Optional[Line] = None
    operating_condition: str
    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    field: str = ""

# フロントエンドに返す形式
class MachineResponse(BaseModel):
    success: bool = True
    data: List[Machine] | Machine = None
    message: Optional[str] = None
    field: Optional[str] = None

    class Config:
        from_attributes = True

# テーブルデータ取得時の形式
class PaginatedMachineResponse(BaseModel):
    machines: Union[MachineResponse, ErrorResponse]
    totalCount: int