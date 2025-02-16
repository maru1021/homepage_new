from fastapi import BackgroundTasks
import pandas as pd
from sqlalchemy.orm import Session

from backend.authority.models import EmployeeAuthority, EmployeeCredential

from backend.authority.employee_authority.crud import get_employees, run_websocket
from backend.scripts.export_excel import export_excel
from backend.scripts.import_excel import import_excel
from backend.scripts.hash_password import hashed_password


def export_excel_employees(db: Session, search):
    employees = get_employees(db, search, return_total_count=False)

    df = pd.DataFrame([
        {
            "ID": employee.id,
            "社員番号": employee.employee_no,
            "従業員名": employee.name,
            "メールアドレス": employee.email,
            "電話番号": employee.info.phone_number,
            "住所": employee.info.address,
            "性別": employee.info.gender,
            "生年月日": employee.info.birth_date,
            "雇用形態": employee.info.employment_type,
            "入社日": employee.info.hire_date,
            "退社日": employee.info.leave_date,
            "契約満了日": employee.info.contract_expiration,
            "緊急連絡先": employee.info.emergency_contact,
        }
        for employee in employees
    ])

    return export_excel(df, "employees.xlsx")
