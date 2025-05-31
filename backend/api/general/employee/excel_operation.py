from sqlalchemy.orm import Session
import pandas as pd

from backend.api.authority.employee_authority.crud import get_employees
from backend.utils.logger import logger
from backend.scripts.export_excel import export_excel


def export_excel_employees(db: Session, search):
    try:
        employees = get_employees(db, search, return_total_count=False)

        df = pd.DataFrame([
            {
                "操作": "",
                "ID": employee.id,
                "社員番号": employee.employee_no,
                "従業員名": employee.name,
                "メールアドレス": employee.email,
                "電話番号": employee.info.phone_number if employee.info else None,
                "住所": employee.info.address if employee.info else None,
                "性別": employee.info.gender if employee.info else None,
                "生年月日": employee.info.birth_date if employee.info else None,
                "雇用形態": employee.info.employment_type if employee.info else None,
                "入社日": employee.info.hire_date if employee.info else None,
                "退社日": employee.info.leave_date if employee.info else None,
                "契約満了日": employee.info.contract_expiration if employee.info else None,
                "緊急連絡先": employee.info.emergency_contact if employee.info else None,
            }
            for employee in employees
        ])

        return export_excel(df, "従業員一覧.xlsx")
    except Exception as e:
        logger.write_error_log(
            f"Error in export_excel_employees: {str(e)}\n"
            f"Function: export_excel_employees\n"
            f"Search: {search}"
        )
        return {"success": False, "message": "Excelファイルのエクスポートに失敗しました", "field": ""}
