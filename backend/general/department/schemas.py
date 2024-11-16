from pydantic import BaseModel, Field
from typing import List

# 登録時の形式
class DepartmentCreate(BaseModel):
    name: str

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
        orm_mode = True