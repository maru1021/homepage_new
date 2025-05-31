from datetime import date

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Union


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
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    emergency_contact: Optional[str] = None
    address:Optional[str] = None
    birth_date: Optional[date] = None
    employment_type: Optional[str] = None
    hire_date: Optional[date] = None
    leave_date: Optional[date] = None
    contract_expiration: Optional[date] = None

    class Config:
        from_attributes = True


# 編集時の形式
class EmployeeUpdate(BaseModel):
    name: str
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    email: EmailStr
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    emergency_contact: Optional[str] = None
    address:Optional[str] = None
    birth_date: Optional[date] = None
    employment_type: Optional[str] = None
    hire_date: Optional[date] = None
    leave_date: Optional[date] = None
    contract_expiration: Optional[date] = None

    class Config:
        from_attributes = True


# テーブルのデータ取得時の形式
class Employee(BaseModel):
    id: int
    employee_no: str = Field(..., pattern=r'^[a-zA-Z0-9]{7}$')
    name: str
    email: Optional[str] = None
    departments: List[Department]
    info: Optional[EmployeeInfo] = None

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