from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from typing import TYPE_CHECKING

from backend.database import Base
from backend.scripts.get_time import today

if TYPE_CHECKING:
    from backend.general.models import Department, Employee


# 従業員と部署の権限を多対多で紐付ける中間テーブル
class EmployeeAuthority(Base):
    __tablename__ = "employee_authority"

    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True)
    admin = Column(Boolean, nullable=False, default=False)

    start_date = Column(Date, nullable=False, default=today)  # 配属日
    end_date = Column(Date, nullable=True)  #異動日

    employee = relationship("Employee", back_populates="employee_authorities", overlaps="departments,employee")
    department = relationship("Department", back_populates="department_authorities", overlaps="employees")


# 従業員の認証情報モデル
class EmployeeCredentials(Base):
    __tablename__ = "employee_credentials"

    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True)
    hashed_password = Column(String, nullable=False)
    password_updated_at = Column(Date, nullable=False, default=today)  # パスワード変更日

    employee = relationship("Employee", back_populates="credentials")