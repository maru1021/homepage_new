from pydantic import BaseModel
from typing import List, Optional, Union

class LineBase(BaseModel):
    name: str
    active: bool = True
    position_x: int = 0
    position_y: int = 0
    searchQuery: Optional[str] = None

class LineCreate(LineBase):
    pass

class LineUpdate(LineBase):
    pass

# テーブルのデータ取得時の形式
class Line(BaseModel):
    id: int
    name: str
    active: bool
    position_x: int
    position_y: int

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    field: str = ""

# フロントエンドに返す形式
class LineResponse(BaseModel):
    success: bool = True
    data: List[Line] | Line = None
    message: Optional[str] = None
    field: Optional[str] = None

    class Config:
        from_attributes = True

# テーブルデータ取得時の形式
class PaginatedLineResponse(BaseModel):
    lines: Union[LineResponse, ErrorResponse]
    totalCount: int