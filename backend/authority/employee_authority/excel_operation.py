from fastapi import BackgroundTasks
import pandas as pd
from sqlalchemy.orm import Session

from backend.authority.employee_authority.crud import get_employees, run_websocket
from backend.scripts.export_excel import export_excel
from backend.scripts.import_excel import import_excel


def export_excel_employees(db: Session, search):
    employees = get_employees(db, search, return_total_count=False)

    df = pd.DataFrame([
        {
            "操作": "",
            "ID": employee.id,
            "従業員名": employee.name,
            "社員番号": employee.employee_no,
            "メールアドレス": employee.email
        }
        for employee in employees
    ])

    return export_excel(df, "employees.xlsx")


def import_excel_employees(db: Session, file, background_tasks=BackgroundTasks):
    from backend.general.models import Employee

    model = Employee
    required_columns = {"操作", "ID", "従業員名", "社員番号", "メールアドレス"}
    websocket_func = lambda: background_tasks.add_task(run_websocket, db)

    def before_add_func(row_data):
        if row_data["employee_no"]:
            existing_employee = db.query(model).filter(model.employee_no == row_data["employee_no"]).first()
        if existing_employee:
            raise ValueError(f"社員番号 '{row_data['employee_no']}' は既に存在しています。")

        return row_data

    def after_add_func(employee_data, db: Session):
        from backend.scripts.init_employee import init_employee
        init_employee(db, employee_data.id)
        return

    return import_excel(db, file,
                        "employee",
                        model,
                        required_columns, websocket_func,
                        before_add_func=before_add_func,
                        after_add_func=after_add_func,
                        name_duplication_check=False
                        )
