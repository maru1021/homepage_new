from pydantic import BaseModel
from typing import List, Optional, Union

class MachineMapBase(BaseModel):
    name: str
    active: bool = True
    position_x: int = 0
    position_y: int = 0
    searchQuery: Optional[str] = None

# テーブルのデータ取得時の形式
class MachineMap(BaseModel):
    id: int
    name: str
    operating_condition: str
    position_x: int | None = None
    position_y: int | None = None

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    field: str = ""

# フロントエンドに返す形式
class MachineMapResponse(BaseModel):
    success: bool = True
    data: List[MachineMap] | MachineMap = None
    message: Optional[str] = None
    field: Optional[str] = None

    class Config:
        from_attributes = True
