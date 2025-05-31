from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
import pandas as pd

from backend.authority.models import EmployeeAuthority
from backend.general.models import Department
from backend.general.department.crud import get_departments
from backend.scripts.export_excel import export_excel
from backend.scripts.import_excel import import_excel
from backend.utils.logger import logger

def export_excel_departments(db: Session, search: str):
    try:
        departments = get_departments(db, search, return_total_count=False)
        df = pd.DataFrame([
            {"操作": "", "ID": department.id, "部署名": department.name}
            for department in departments
        ])
        return export_excel(df, "部署一覧.xlsx")
    except Exception as e:
        logger.write_error_log(
            f"Error in export_excel_departments: {str(e)}\n"
            f"Function: export_excel_departments\n"
            f"Search: {search}"
        )
        return {"success": False, "message": "Excelファイルのエクスポートに失敗しました", "field": ""}

def import_excel_departments(db: Session, file, background_tasks=BackgroundTasks):
    try:
        from backend.general.department.crud import run_websocket

        model = Department
        required_columns = {"操作", "ID", "部署名"}
        websocket_func = lambda: background_tasks.add_task(run_websocket, db)

        def delete_check_func(db, department, department_id):
            employee_count = db.query(EmployeeAuthority.department_id).filter(
                EmployeeAuthority.department_id == department_id
            ).count()

            if employee_count > 0:
                return {"success": False, "message": f"{department.name} に所属する従業員がいるため削除できません。", "field": ""}

        return import_excel(db, file, "department", model, required_columns, websocket_func, delete_check_func=delete_check_func)
    except Exception as e:
        logger.write_error_log(
            f"Error in import_excel_departments: {str(e)}\n"
            f"Function: import_excel_departments\n"
            f"File: {file}"
        )
        return {"success": False, "message": "Excelファイルのインポートに失敗しました", "field": ""}

