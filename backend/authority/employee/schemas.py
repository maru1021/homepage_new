from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# 社員と紐づいた部署
class EmployeeDepartment(BaseModel):
    department: int
    admin: bool

class Department(BaseModel):
    id: int
    name: str
    admin: bool

# 登録時の形式
class EmployeeCreate(BaseModel):
    name: str
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    password: str
    email: EmailStr
    forms: List[EmployeeDepartment]

    class Config:
        from_attributes = True

class EmployeeDepartmentUpdate(BaseModel):
    department: int
    admin: bool

# 編集時の形式
class EmployeeUpdate(BaseModel):
    name: str
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    forms: List[EmployeeDepartment]

    class Config:
        from_attributes = True


# テーブルのデータ取得時の形式
class Employee(BaseModel):
    id: int
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    name: str
    departments: List[Department]

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
        from_attributes = True

# ログインリクエスト用モデル
class LoginRequest(BaseModel):
    employee_no: str
    password: str
