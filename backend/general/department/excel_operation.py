from io import BytesIO

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
import pandas as pd

from backend.authority.models import EmployeeAuthority
from backend.general.models import Department
from backend.general.department.crud import get_departments
from backend.scripts.export_excel import export_excel
from backend.scripts.import_excel import import_excel


def export_excel_departments(db: Session, search: str):
    departments = get_departments(db, search, return_total_count=False)

    # DataFrame に変換（1列目のタイトルを「操作」に設定）
    df = pd.DataFrame([
        {"操作": "", "ID": department.id, "部署名": department.name}
        for department in departments
    ])

    return export_excel(df, "departments.xlsx")

def import_excel_departments(db: Session, file, background_tasks=BackgroundTasks):
    from backend.general.department.crud import run_websocket

    model = Department
    required_columns = {"操作", "ID", "部署名"}
    websocket_func = lambda: background_tasks.add_task(run_websocket, db)

    def delete_check_func(db, department, department_id):
        employee_count = db.query(EmployeeAuthority.department_id).filter(
            EmployeeAuthority.department_id == department_id
        ).count()

        if employee_count > 0:
            raise ValueError(f"{department.name} に所属する従業員がいるため削除できません。")


    return import_excel(db, file, "department", model, required_columns, websocket_func, delete_check_func=delete_check_func)

