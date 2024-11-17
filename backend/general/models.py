from backend.database import Base
from sqlalchemy import Table, Column, Integer, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship

# 従業員と部署を多対多で紐付ける中間テーブル
# 管理者権限もこのモデルで行う
employee_department = Table(
    "employee_department",
    Base.metadata,
    Column("employee_id", Integer, ForeignKey("employees.id"), primary_key=True),
    Column("department_id", Integer, ForeignKey("departments.id"), primary_key=True),
    Column("admin", Boolean, default=False)
)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), index=True)

    # Employee とのリレーション
    employees = relationship(
        "Employee",
        secondary=employee_department,
        back_populates="departments"
    )

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_no = Column(String(7), unique=True, index=True)
    name = Column(String(50), index=True)
    password = Column(String(255), nullable=False)

    # Department とのリレーション
    departments = relationship(
        "Department",
        secondary=employee_department,
        back_populates="employees"
    )

