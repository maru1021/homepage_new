import io
import base64
import pandas as pd
from fastapi.responses import FileResponse
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
from backend.logger_config import logger


def export_excel(df, file_name):
    try:
        # Excelファイルをメモリ上で作成
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Sheet1')
            # ワークブックとワークシートを取得
            workbook = writer.book
            worksheet = writer.sheets['Sheet1']

            # プルダウンリストの選択肢を定義
            dropdown_options = ['追加', '編集', '削除']

            # データ検証を設定（プルダウンリスト）
            for row in range(2, len(df) + 2):  # ヘッダー行を考慮して2から開始
                cell = worksheet.cell(row=row, column=1)  # A列（操作列）
                cell.value = ''  # 初期値を空に設定
                # データ検証を追加
                dv = DataValidation(type="list", formula1=f'"{",".join(dropdown_options)}"', allow_blank=True)
                dv.add(cell)
                worksheet.add_data_validation(dv)

        excel_buffer.seek(0)
        # base64エンコード
        excel_data = base64.b64encode(excel_buffer.read()).decode('utf-8')

        return {
            "success": True,
            "data": {
                "file_data": excel_data,
                "filename": file_name,
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        }
    except Exception as e:
        logger.error(f"Error in export_excel: {str(e)}", exc_info=True, extra={
            "function": "export_excel",
            "df": df,
            "file_name": file_name
        })
        return {"success": False, "message": "Excelファイルのエクスポートに失敗しました", "field": ""}