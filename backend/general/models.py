from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from typing import TYPE_CHECKING

from backend.database import Base
from backend.scripts.get_time import today

if TYPE_CHECKING:
    from backend.authority.models import EmployeeCredential, EmployeeAuthority

# 部署モデル
class Department(Base):
    __tablename__ = "departments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, index=True)

    department_authorities = relationship(
        "EmployeeAuthority",
        back_populates="department",
        overlaps="employees",
    )

    employees = relationship(
        "Employee",
        secondary="employee_authority",
        back_populates="departments",
        overlaps="employee_authorities, department_authorities",
    )

# 従業員モデル
class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_no = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    email = Column(String, index=True, nullable=True)
    last_login = Column(DateTime, nullable=True)

    employee_authorities = relationship(
        "EmployeeAuthority",
        back_populates="employee",
        cascade="all, delete-orphan",
        overlaps="departments, department_authorities",
    )

    # 部署とのリレーション
    departments = relationship(
        "Department",
        secondary="employee_authority",
        back_populates="employees",
        overlaps="employee_authorities, department_authorities",
    )

    credential = relationship("EmployeeCredential",
        uselist=False,
        back_populates="employee",
        cascade="all, delete-orphan"
    )

    info = relationship("EmployeeInfo",
        uselist=False,
        back_populates="employee",
        cascade="all, delete-orphan"
    )

class EmployeeInfo(Base):
    __tablename__ = "employeeinfos"
    __table_args__ = {"extend_existing": True}

    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True)
    phone_number = Column(String, nullable=True)
    gender = Column(String(2), nullable=True)
    emergency_contact = Column(String(20), nullable=True)  #緊急連絡先
    address = Column(String, nullable=True)
    birth_date = Column(Date, nullable=True)

    # 雇用情報
    employment_type = Column(String(20), nullable=False, default="正社員")  # 雇用形態
    hire_date = Column(Date, nullable=False, default=today)  # 入社日
    leave_date = Column(Date, nullable=True)  #退職日
    contract_expiration = Column(Date, nullable=True)  # 契約満了日

    employee = relationship("Employee", back_populates="info")