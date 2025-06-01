from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
import pandas as pd

from backend.api.manufacturing.model.machine_models import Line
from backend.api.manufacturing.line.crud import get_lines
from backend.scripts.export_excel import export_excel
from backend.scripts.import_excel import import_excel
from backend.utils.logger import logger

def export_excel_lines(db: Session, search: str):
    try:
        lines = get_lines(db, search, return_total_count=False)
        df = pd.DataFrame([
            {"操作": "", "ID": line.id, "ライン名": line.name}
            for line in lines
        ])
        return export_excel(df, "ライン一覧.xlsx")
    except Exception as e:
        logger.write_error_log(
            f"Error in export_excel_lines: {str(e)}\n"
            f"Function: export_excel_lines\n"
            f"Search: {search}"
        )
        return {"success": False, "message": "Excelファイルのエクスポートに失敗しました", "field": ""}

def import_excel_lines(db: Session, file, background_tasks=BackgroundTasks):
    try:
        from backend.api.manufacturing.line.crud import run_websocket

        model = Line
        required_columns = {"操作", "ID", "ライン名"}
        websocket_func = lambda: background_tasks.add_task(run_websocket, db)

        return import_excel(db, file, "line", model, required_columns, websocket_func)
    except Exception as e:
        logger.write_error_log(
            f"Error in import_excel_lines: {str(e)}\n"
            f"Function: import_excel_lines\n"
            f"File: {file}"
        )
        return {"success": False, "message": "Excelファイルのインポートに失敗しました", "field": ""}