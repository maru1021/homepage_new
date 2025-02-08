import tempfile

from fastapi.responses import FileResponse
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation


def export_excel(df, file_name):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_file:
        file_path = tmp_file.name

    wb = Workbook()
    ws = wb.active
    ws.append(df.columns.tolist())  # カラム名を追加

    for row in df.itertuples(index=False):
        ws.append(row)

    dv = DataValidation(
        type="list",
        formula1='"追加,編集,削除"',
        showDropDown=True
    )

    max_row = ws.max_row
    if max_row > 1:
        for row in range(2, max_row + 1):
            dv.add(ws[f"A{row}"])
        ws.add_data_validation(dv)

    wb.save(file_path)

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'}
    )