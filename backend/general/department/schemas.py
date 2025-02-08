from pydantic import BaseModel
from typing import List, Optional

class DepartmentBase(BaseModel):
    name:str
    searchQuery: Optional[str] = None

# テーブルのデータ取得時の形式
class Department(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class PaginatedDepartmentResponse(BaseModel):
    departments: List[Department]
    totalCount: int

# Post時の返す形式
class DepartmentResponse(BaseModel):
    success: bool = True
    message: str
    field: str = ''

    class Config:
        from_attributes = True