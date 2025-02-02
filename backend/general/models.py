from backend.database import Base
from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from backend.authority.models import Employee

# 部署モデル
class Department(Base):
    __tablename__ = "departments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)

    department_authorities = relationship(
        "EmployeeAuthority",
        back_populates="department",
        overlaps="employees"
    )

    employees = relationship(
        "Employee",
        secondary="employee_authority",
        back_populates="departments",
        overlaps="department_authorities"
    )