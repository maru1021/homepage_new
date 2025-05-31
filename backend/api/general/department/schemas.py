from pydantic import BaseModel
from typing import List, Optional, Union

class DepartmentBase(BaseModel):
    name: str
    searchQuery: Optional[str] = None

# テーブルのデータ取得時の形式
class Department(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    field: str = ""

# フロントエンドに返す形式
class DepartmentResponse(BaseModel):
    success: bool = True
    data: List[Department] | Department = None
    message: Optional[str] = None
    field: Optional[str] = None

    class Config:
        from_attributes = True

# テーブルデータ取得時の形式
class PaginatedDepartmentResponse(BaseModel):
    departments: Union[DepartmentResponse, ErrorResponse]
    totalCount: int