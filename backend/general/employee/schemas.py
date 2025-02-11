from datetime import date

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# 社員と紐づいた部署
class EmployeeDepartment(BaseModel):
    department: int
    admin: bool

class Department(BaseModel):
    id: int
    name: str

class EmployeeInfo(BaseModel):
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    emergency_contact: Optional[str] = None
    address:Optional[str] = None
    birth_date: Optional[date] = None
    employment_type: Optional[str] = None
    hire_date: Optional[date] = None
    leave_date: Optional[date] = None
    contract_expiration: Optional[date] = None


# 登録時の形式
class EmployeeCreate(BaseModel):
    name: str
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    email: EmailStr

    class Config:
        from_attributes = True

class EmployeeDepartmentUpdate(BaseModel):
    department: int
    admin: bool

# 編集時の形式
class EmployeeUpdate(BaseModel):
    name: str
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')

    class Config:
        from_attributes = True


# テーブルのデータ取得時の形式
class Employee(BaseModel):
    id: int
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    name: str
    departments: List[Department]
    info: Optional[EmployeeInfo] = None

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
