from backend.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.general.models import Department

# 従業員と部署の権限を多対多で紐付ける中間テーブル
class EmployeeAuthority(Base):
    __tablename__ = "employee_authority"

    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True)
    admin = Column(Boolean, nullable=False, default=False)

    employee = relationship("Employee", back_populates="employee_authorities", overlaps="departments,employee")
    department = relationship("Department", back_populates="department_authorities", overlaps="employees")

# 従業員モデル
class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    employee_no = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, index=True, nullable=False)
    email = Column(String, index=True, nullable=False)

    employee_authorities = relationship(
        "EmployeeAuthority",
        back_populates="employee",
        overlaps="departments",
        cascade="all, delete-orphan",
    )

    # 🔹 部署とのリレーション
    departments = relationship(
        "Department",
        secondary="employee_authority",
        back_populates="employees",
        overlaps="employee_authorities,employee"
    )
