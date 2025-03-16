import io
import logging
import unicodedata
from typing import Optional, Tuple, Dict, Any
from datetime import datetime

import openpyxl
from openpyxl.styles import Border, Side, Alignment
from openpyxl.utils import get_column_letter
from sqlalchemy.orm import Session

from backend.all.models import BulletinPost, BulletinCell, CellStyle, BulletinMerge
from backend.all.models import BulletinColumnDimension, BulletinRowDimension

logger = logging.getLogger(__name__)

class ExcelService:
    @staticmethod
    def _fix_color_format(color_str):
        """
        色情報をaRGB形式に修正する補助関数
        """
        if not color_str:
            return None

        # 無効な値や非文字列の場合はNone
        if not isinstance(color_str, str):
            return None

        # 透明色または空の色
        if color_str == "00000000" or color_str == "":
            return None

        # '#'で始まる場合は削除
        if color_str.startswith('#'):
            color_str = color_str[1:]

        # 8桁の場合はaRGB形式と見なす
        if len(color_str) == 8:
            return color_str

        # 6桁のRGB値の場合、先頭にFFを追加（不透明）
        if len(color_str) == 6:
            return "FF" + color_str

        # その他の形式は安全な値を返す
        return "FF000000"  # 黒色（不透明）

    @staticmethod
    async def parse_excel_to_db(
        file_data: io.BytesIO,
        filename: str,
        employee_id: int,
        title: str,
        content: Optional[str],
        db: Session
    ) -> BulletinPost:
        """
        Excelファイルを解析してデータベースに保存する
        """
        try:
            # 新しい掲示板投稿を作成
            bulletin_post = BulletinPost(
                title=title,
                content=content,
                employee_id=employee_id,  # 従業員ID
                filename=filename
            )
            db.add(bulletin_post)
            db.flush()  # IDを取得するためにフラッシュ

            # Excelファイルを読み込む
            workbook = openpyxl.load_workbook(file_data)
            sheet = workbook.active  # アクティブなシートを使用

            # セルデータの保存
            for row_idx, row in enumerate(sheet.iter_rows(), 1):
                for col_idx, cell in enumerate(row, 1):
                    # セルの値を取得
                    cell_value = str(cell.value) if cell.value is not None else None

                    # セルデータを作成
                    bulletin_cell = BulletinCell(
                        bulletin_id=bulletin_post.id,
                        row=row_idx,
                        col=col_idx,
                        value=cell_value
                    )
                    db.add(bulletin_cell)
                    db.flush()  # セルIDを取得

                    # セルのスタイル情報を処理
                    cell_style = ExcelService._parse_cell_style(cell)
                    if cell_style:
                        style = CellStyle(
                            cell_id=bulletin_cell.id,
                            **cell_style
                        )
                        db.add(style)

            # 結合セルの情報を保存
            for merged_cell_range in sheet.merged_cells.ranges:
                min_row, min_col, max_row, max_col = merged_cell_range.min_row, merged_cell_range.min_col, merged_cell_range.max_row, merged_cell_range.max_col

                merge = BulletinMerge(
                    bulletin_id=bulletin_post.id,
                    start_row=min_row,
                    start_col=min_col,
                    end_row=max_row,
                    end_col=max_col
                )
                db.add(merge)

            # 列の幅情報を保存
            for col_letter, column_dimension in sheet.column_dimensions.items():
                col_idx = openpyxl.utils.column_index_from_string(col_letter)

                # 幅が設定されている場合のみ保存
                if column_dimension.width is not None:
                    col_dim = BulletinColumnDimension(
                        bulletin_id=bulletin_post.id,
                        col=col_idx,
                        width=column_dimension.width
                    )
                    db.add(col_dim)

            # 行の高さ情報を保存
            for row_idx, row_dimension in sheet.row_dimensions.items():
                # 高さが設定されている場合のみ保存
                if row_dimension.height is not None:
                    row_dim = BulletinRowDimension(
                        bulletin_id=bulletin_post.id,
                        row=row_idx,
                        height=row_dimension.height
                    )
                    db.add(row_dim)

            # トランザクションをコミット
            db.commit()

            return bulletin_post

        except Exception as e:
            db.rollback()
            error_message = f"エクセル解析エラー: {filename} - {str(e)}"
            logger.error(error_message)
            raise Exception(error_message)

    @staticmethod
    def _parse_cell_style(cell) -> Dict[str, Any]:
        """
        セルのスタイル情報を解析して辞書形式で返す
        """
        style = {}

        # フォント情報の処理
        if cell.font:
            style['font_bold'] = cell.font.bold

            # フォントカラーの処理 - エラーハンドリングを追加
            try:
                if hasattr(cell.font.color, 'rgb') and cell.font.color.rgb:
                    # RGBカラーコードを取得 - 最大64文字に制限
                    style['font_color'] = str(cell.font.color.rgb)[:64]
                else:
                    style['font_color'] = None
            except Exception as e:
                # エラーの場合はNoneを設定
                style['font_color'] = None
                logger.warning(f"フォントカラー処理エラー: {str(e)}")

            # フォントサイズの処理
            try:
                style['font_size'] = float(cell.font.size) if cell.font.size else None
            except (TypeError, ValueError):
                style['font_size'] = None
        else:
            style['font_bold'] = False
            style['font_color'] = None
            style['font_size'] = None

        # 背景色の処理
        try:
            if cell.fill and hasattr(cell.fill, 'fgColor') and cell.fill.fgColor.rgb:
                # RGBカラーコードを取得 - 最大64文字に制限
                style['bg_color'] = str(cell.fill.fgColor.rgb)[:64]
            else:
                style['bg_color'] = None
        except Exception as e:
            style['bg_color'] = None
            logger.warning(f"背景色処理エラー: {str(e)}")

        # 罫線スタイルの処理
        if cell.border:
            # 上罫線
            if cell.border.top:
                style['border_top_style'] = str(cell.border.top.style)[:16] if cell.border.top.style else None
                try:
                    if hasattr(cell.border.top.color, 'rgb') and cell.border.top.color.rgb:
                        style['border_top_color'] = str(cell.border.top.color.rgb)[:64]
                    else:
                        style['border_top_color'] = None
                except Exception:
                    style['border_top_color'] = None

            # 右罫線
            if cell.border.right:
                style['border_right_style'] = str(cell.border.right.style)[:16] if cell.border.right.style else None
                try:
                    if hasattr(cell.border.right.color, 'rgb') and cell.border.right.color.rgb:
                        style['border_right_color'] = str(cell.border.right.color.rgb)[:64]
                    else:
                        style['border_right_color'] = None
                except Exception:
                    style['border_right_color'] = None

            # 下罫線
            if cell.border.bottom:
                style['border_bottom_style'] = str(cell.border.bottom.style)[:16] if cell.border.bottom.style else None
                try:
                    if hasattr(cell.border.bottom.color, 'rgb') and cell.border.bottom.color.rgb:
                        style['border_bottom_color'] = str(cell.border.bottom.color.rgb)[:64]
                    else:
                        style['border_bottom_color'] = None
                except Exception:
                    style['border_bottom_color'] = None

            # 左罫線
            if cell.border.left:
                style['border_left_style'] = str(cell.border.left.style)[:16] if cell.border.left.style else None
                try:
                    if hasattr(cell.border.left.color, 'rgb') and cell.border.left.color.rgb:
                        style['border_left_color'] = str(cell.border.left.color.rgb)[:64]
                    else:
                        style['border_left_color'] = None
                except Exception:
                    style['border_left_color'] = None

        # 配置情報の処理
        if cell.alignment:
            style['alignment_horizontal'] = str(cell.alignment.horizontal)[:16] if cell.alignment.horizontal else None
            style['alignment_vertical'] = str(cell.alignment.vertical)[:16] if cell.alignment.vertical else None

        return style

    @staticmethod
    async def generate_excel_from_db(bulletin_id: int, db: Session) -> Tuple[io.BytesIO, str]:
        """
        データベースから掲示板データを取得してExcelファイルを生成する
        """
        # 掲示板投稿と関連データを取得
        post = db.query(BulletinPost).filter(BulletinPost.id == bulletin_id).first()
        if not post:
            raise Exception(f"ID {bulletin_id} の掲示板投稿が見つかりません")

        # セルデータを取得
        cells = db.query(BulletinCell).filter(BulletinCell.bulletin_id == bulletin_id).all()

        # セル結合情報を取得
        merges = db.query(BulletinMerge).filter(BulletinMerge.bulletin_id == bulletin_id).all()

        # 列の幅情報を取得
        column_dimensions = db.query(BulletinColumnDimension).filter(
            BulletinColumnDimension.bulletin_id == bulletin_id
        ).all()

        # 行の高さ情報を取得
        row_dimensions = db.query(BulletinRowDimension).filter(
            BulletinRowDimension.bulletin_id == bulletin_id
        ).all()

        # 新しいExcelファイルを作成
        workbook = openpyxl.Workbook()
        sheet = workbook.active

        # セルデータを設定
        for cell_data in cells:
            # スタイル情報を取得
            style = db.query(CellStyle).filter(CellStyle.cell_id == cell_data.id).first()

            # セルの値を設定
            sheet.cell(row=cell_data.row, column=cell_data.col, value=cell_data.value)

            # スタイル情報があれば適用
            if style:
                cell = sheet.cell(row=cell_data.row, column=cell_data.col)

                # フォントスタイルの設定
                if style.font_bold or style.font_color or style.font_size:
                    font_args = {
                        'bold': style.font_bold,
                        'size': style.font_size
                    }

                    # 色の処理
                    if style.font_color:
                        fixed_color = ExcelService._fix_color_format(style.font_color)
                        if fixed_color:
                            font_args['color'] = fixed_color

                    cell.font = openpyxl.styles.Font(**font_args)

                # 背景色の設定
                if style.bg_color:
                    fixed_bg_color = ExcelService._fix_color_format(style.bg_color)
                    if fixed_bg_color:
                        fill = openpyxl.styles.PatternFill(
                            fill_type='solid',
                            fgColor=fixed_bg_color
                        )
                        cell.fill = fill

                # 罫線の設定
                borders = {}
                if style.border_top_style:
                    top_color = ExcelService._fix_color_format(style.border_top_color) if style.border_top_color else None
                    borders['top'] = Side(style=style.border_top_style, color=top_color)

                if style.border_right_style:
                    right_color = ExcelService._fix_color_format(style.border_right_color) if style.border_right_color else None
                    borders['right'] = Side(style=style.border_right_style, color=right_color)

                if style.border_bottom_style:
                    bottom_color = ExcelService._fix_color_format(style.border_bottom_color) if style.border_bottom_color else None
                    borders['bottom'] = Side(style=style.border_bottom_style, color=bottom_color)

                if style.border_left_style:
                    left_color = ExcelService._fix_color_format(style.border_left_color) if style.border_left_color else None
                    borders['left'] = Side(style=style.border_left_style, color=left_color)

                if borders:
                    cell.border = Border(**borders)

                # 配置の設定
                if style.alignment_horizontal or style.alignment_vertical:
                    alignment = Alignment(
                        horizontal=style.alignment_horizontal,
                        vertical=style.alignment_vertical
                    )
                    cell.alignment = alignment

        # セル結合の適用
        for merge in merges:
            sheet.merge_cells(
                start_row=merge.start_row,
                start_column=merge.start_col,
                end_row=merge.end_row,
                end_column=merge.end_col
            )

        # 列の幅を設定
        for col_dim in column_dimensions:
            col_letter = get_column_letter(col_dim.col)
            sheet.column_dimensions[col_letter].width = col_dim.width

        # 行の高さを設定
        for row_dim in row_dimensions:
            sheet.row_dimensions[row_dim.row].height = row_dim.height

        # メモリ上にファイルを保存
        output = io.BytesIO()
        workbook.save(output)
        output.seek(0)

        # ファイル名の生成（元のファイル名がある場合はそれを使用、なければ掲示板のタイトルを使用）
        if post.filename:
            # 日本語などの非ASCII文字をURLエンコード
            original_filename = post.filename
            # 拡張子を保持するため、最後の.以降を分割
            if '.' in original_filename:
                name_part, ext_part = original_filename.rsplit('.', 1)
                # ASCII化 - 日本語などはローマ字に変換し、その他の特殊文字は削除
                ascii_name = unicodedata.normalize('NFKD', name_part).encode('ASCII', 'ignore').decode()
                # 特殊文字を削除してアンダースコアに置き換え
                safe_name = ''.join(c if c.isalnum() or c in '_- ' else '_' for c in ascii_name)
                filename = f"{safe_name}.{ext_part}"
            else:
                # 拡張子がない場合
                ascii_name = unicodedata.normalize('NFKD', original_filename).encode('ASCII', 'ignore').decode()
                safe_name = ''.join(c if c.isalnum() or c in '_- ' else '_' for c in ascii_name)
                filename = f"{safe_name}.xlsx"  # デフォルトの拡張子を追加
        else:
            # タイトルを使ってファイル名を生成（特殊文字を取り除く）
            ascii_title = unicodedata.normalize('NFKD', post.title).encode('ASCII', 'ignore').decode()
            safe_title = ''.join(c if c.isalnum() or c in '_- ' else '_' for c in ascii_title)
            filename = f"{safe_title}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

        return output, filename