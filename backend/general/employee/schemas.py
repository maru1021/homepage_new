from pydantic import BaseModel, Field
from typing import List

# 登録時の形式
class EmployeeCreate(BaseModel):
    name: str
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    password: str

# テーブルのデータ取得時の形式
class Employee(BaseModel):
    id: int
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    name: str

    class Config:
        from_attributes = True

class PaginatedEmployeeResponse(BaseModel):
    employees: List[Employee]
    totalCount: int

# Post時の返す形式
class EmployeeResponse(BaseModel):
    success: bool = True
    message: str
    field: str = ''

    class Config:
        orm_mode = True

# ログインリクエスト用モデル
class LoginRequest(BaseModel):
    employee_no: str
    password: str