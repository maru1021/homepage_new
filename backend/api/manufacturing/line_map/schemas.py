from pydantic import BaseModel
from typing import List, Optional, Union

class LineMapBase(BaseModel):
    name: str
    active: bool = True
    position_x: int = 0
    position_y: int = 0
    searchQuery: Optional[str] = None

class LineMapCreate(LineMapBase):
    pass

class LineMapUpdate(LineMapBase):
    pass

# テーブルのデータ取得時の形式
class LineMap(BaseModel):
    id: int
    name: str
    position_x: int | None = None
    position_y: int | None = None

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    field: str = ""

# フロントエンドに返す形式
class LineMapResponse(BaseModel):
    success: bool = True
    data: List[LineMap] | LineMap = None
    message: Optional[str] = None
    field: Optional[str] = None

    class Config:
        from_attributes = True
