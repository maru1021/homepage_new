from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Union

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
    email: str
    departments: List[Department]

    class Config:
        from_attributes = True

# フロントエンドに返す形式
class EmployeeResponse(BaseModel):
    success: bool = True
    data: List[Employee] | Employee = None
    message: Optional[str] = None
    field: Optional[str] = None

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    field: str = ""

# テーブルデータ取得時の形式
class PaginatedEmployeeResponse(BaseModel):
    employees: Union[EmployeeResponse, ErrorResponse]
    totalCount: int

# ログインリクエスト用モデル
class LoginRequest(BaseModel):
    employee_no: str
    password: str
