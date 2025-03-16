import io
import logging
import unicodedata
import pandas as pd
import urllib.parse
import asyncio
from typing import Optional, Tuple, Dict, Any, List
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

import openpyxl
from openpyxl.styles import Border, Side, Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from sqlalchemy.orm import Session, joinedload
from fastapi.responses import StreamingResponse
from fastapi import HTTPException, status

from backend.all.models import BulletinPost, BulletinCell, CellStyle, BulletinMerge
from backend.all.models import BulletinColumnDimension, BulletinRowDimension

logger = logging.getLogger(__name__)

# スレッドプールエグゼキューター - CPU負荷の高い処理用
thread_executor = ThreadPoolExecutor(max_workers=4)


# ============= Excel解析関連関数 =============

# エクセルファイルを解析してデータベースに保存する
async def parse_excel_to_db(
    file_data: io.BytesIO, filename: str, employee_id: int,
    title: str, content: Optional[str], db: Session
) -> BulletinPost:
    try:
        # 掲示板投稿を作成
        bulletin_post = BulletinPost(
            title=title, content=content,
            employee_id=employee_id, filename=filename
        )
        db.add(bulletin_post)
        db.flush()

        # Pandasによる読み込みとOpenpyxlによる読み込みを並行して実行
        df_task = asyncio.create_task(_run_in_thread(
            lambda: pd.read_excel(file_data, engine='openpyxl')
        ))

        # ファイルポインタを先頭に戻す
        file_data.seek(0)

        workbook_task = asyncio.create_task(_run_in_thread(
            lambda: openpyxl.load_workbook(file_data)
        ))

        # 両方のタスクが完了するのを待つ
        df = await df_task
        workbook = await workbook_task

        sheet = workbook.active

        # データ処理
        cell_id_mapping = await _process_cell_data(df, bulletin_post.id, db)
        await _process_styles_and_properties(sheet, cell_id_mapping, bulletin_post.id, db)

        db.commit()
        return bulletin_post

    except Exception as e:
        db.rollback()
        error_message = f"エクセル解析エラー: {filename} - {str(e)}"
        logger.error(error_message)
        raise Exception(error_message)


# セルデータを処理しマッピングを返す
async def _process_cell_data(df, bulletin_id, db):
    # 一括でセルオブジェクトを作成して処理を効率化
    cells_to_add = [
        BulletinCell(
            bulletin_id=bulletin_id,
            row=row_idx + 1,  # pandasは0始まりなので+1
            col=col_idx,
            value=str(value) if pd.notna(value) else None
        )
        for row_idx, row in df.iterrows()
        for col_idx, value in enumerate(row, 1)
    ]

    # セルを一括で追加
    db.bulk_save_objects(cells_to_add)
    db.flush()

    # ID取得のためにもう一度クエリ実行（bulk_save_objectsでは自動生成IDが取得できないため）
    cells = db.query(BulletinCell).filter(BulletinCell.bulletin_id == bulletin_id).all()
    return {(cell.row, cell.col): cell.id for cell in cells}


# スタイルとシート特性を処理
async def _process_styles_and_properties(sheet, cell_id_mapping, bulletin_id, db):
    # データ収集タスクを並行実行
    style_task = asyncio.create_task(_collect_cell_styles(sheet, cell_id_mapping))
    merge_task = asyncio.create_task(_collect_merge_ranges(sheet, bulletin_id))
    col_dim_task = asyncio.create_task(_collect_column_dimensions(sheet, bulletin_id))
    row_dim_task = asyncio.create_task(_collect_row_dimensions(sheet, bulletin_id))

    # 全てのタスクから結果を取得
    styles, merges, col_dims, row_dims = await asyncio.gather(
        style_task, merge_task, col_dim_task, row_dim_task
    )

    # 一括でデータベースに保存
    for data_list in [styles, merges, col_dims, row_dims]:
        if data_list:
            db.bulk_save_objects(data_list)


# シートからセルスタイル情報を収集
async def _collect_cell_styles(sheet, cell_id_mapping):
    def process_cells():
        return [
            CellStyle(cell_id=cell_id_mapping[(row_idx, col_idx)], **cell_style)
            for row_idx, row in enumerate(sheet.iter_rows(), 1)
            for col_idx, cell in enumerate(row, 1)
            if (cell_style := _parse_cell_style(cell)) and (row_idx, col_idx) in cell_id_mapping
        ]

    # スレッドプールで実行
    return await _run_in_thread(process_cells)


# シートから結合セル情報を収集
async def _collect_merge_ranges(sheet, bulletin_id):
    return [
        BulletinMerge(
            bulletin_id=bulletin_id,
            start_row=merged_range.min_row,
            start_col=merged_range.min_col,
            end_row=merged_range.max_row,
            end_col=merged_range.max_col
        )
        for merged_range in sheet.merged_cells.ranges
    ]


# シートから列幅情報を収集
async def _collect_column_dimensions(sheet, bulletin_id):
    return [
        BulletinColumnDimension(
            bulletin_id=bulletin_id,
            col=openpyxl.utils.column_index_from_string(col_letter),
            width=col_dim.width
        )
        for col_letter, col_dim in sheet.column_dimensions.items()
        if col_dim.width is not None
    ]


# シートから行高情報を収集
async def _collect_row_dimensions(sheet, bulletin_id):
    return [
        BulletinRowDimension(
            bulletin_id=bulletin_id,
            row=row_idx,
            height=row_dim.height
        )
        for row_idx, row_dim in sheet.row_dimensions.items()
        if row_dim.height is not None
    ]


# ============= Excel更新関連関数 =============

# 既存の掲示板投稿のExcelデータを更新する
async def update_excel_in_db(
    bulletin_id: int, file_data: io.BytesIO,
    filename: str, title: str, content: Optional[str], db: Session
) -> BulletinPost:
    try:
        # 関連データ削除
        await _delete_related_data(bulletin_id, db)

        # 基本情報更新
        post = db.query(BulletinPost).filter(BulletinPost.id == bulletin_id).first()
        post.title = title
        post.content = content
        post.filename = filename
        post.updated_at = datetime.utcnow()
        db.flush()

        # 並行処理でデータ読み込み
        df_task = asyncio.create_task(_run_in_thread(
            lambda: pd.read_excel(file_data, engine='openpyxl')
        ))

        file_data.seek(0)

        workbook_task = asyncio.create_task(_run_in_thread(
            lambda: openpyxl.load_workbook(file_data, data_only=True)
        ))

        df, workbook = await asyncio.gather(df_task, workbook_task)
        sheet = workbook.active

        # データ処理
        cell_id_mapping = await _process_cell_data(df, bulletin_id, db)
        await _process_styles_and_properties(sheet, cell_id_mapping, bulletin_id, db)

        db.commit()
        return post

    except Exception as e:
        db.rollback()
        error_message = f"エクセル更新エラー: ID {bulletin_id} - {str(e)}"
        logger.error(error_message)
        raise Exception(error_message)


# 掲示板投稿の関連データを削除
async def _delete_related_data(bulletin_id, db):
    from sqlalchemy import select
    cell_ids_query = select(BulletinCell.id).where(BulletinCell.bulletin_id == bulletin_id)

    # 関連データを一括削除
    db.query(CellStyle).filter(CellStyle.cell_id.in_(cell_ids_query)).delete(synchronize_session=False)
    db.query(BulletinCell).filter(BulletinCell.bulletin_id == bulletin_id).delete(synchronize_session=False)
    db.query(BulletinMerge).filter(BulletinMerge.bulletin_id == bulletin_id).delete(synchronize_session=False)
    db.query(BulletinColumnDimension).filter(BulletinColumnDimension.bulletin_id == bulletin_id).delete(synchronize_session=False)
    db.query(BulletinRowDimension).filter(BulletinRowDimension.bulletin_id == bulletin_id).delete(synchronize_session=False)


# ============= Excel生成関連関数 =============

# データベースのデータからExcelファイルを生成する
async def generate_excel_from_db(bulletin_id: int, db: Session) -> Tuple[io.BytesIO, str]:
    # 掲示板投稿と関連データ取得
    post = db.query(BulletinPost).filter(BulletinPost.id == bulletin_id).first()
    if not post:
        raise Exception(f"ID {bulletin_id} の掲示板投稿が見つかりません")

    # 並行して各種データを取得
    cells_task = _run_in_thread(
        lambda: db.query(BulletinCell).filter(BulletinCell.bulletin_id == bulletin_id).all()
    )
    merges_task = _run_in_thread(
        lambda: db.query(BulletinMerge).filter(BulletinMerge.bulletin_id == bulletin_id).all()
    )
    column_dims_task = _run_in_thread(
        lambda: db.query(BulletinColumnDimension).filter(BulletinColumnDimension.bulletin_id == bulletin_id).all()
    )
    row_dims_task = _run_in_thread(
        lambda: db.query(BulletinRowDimension).filter(BulletinRowDimension.bulletin_id == bulletin_id).all()
    )

    # 各タスクの完了を待機
    cells, merges, column_dims, row_dims = await asyncio.gather(
        cells_task, merges_task, column_dims_task, row_dims_task
    )

    # セルスタイル情報を効率的に取得
    cell_ids = [cell.id for cell in cells]
    styles = db.query(CellStyle).filter(CellStyle.cell_id.in_(cell_ids)).all() if cell_ids else []
    style_map = {style.cell_id: style for style in styles}

    # Excelファイル作成処理をスレッドプールで実行
    output = await _run_in_thread(
        lambda: _create_excel_file(cells, merges, column_dims, row_dims, style_map)
    )

    return output, _generate_safe_filename(post)


# Excelファイルを作成する
def _create_excel_file(cells, merges, column_dims, row_dims, style_map):
    workbook = openpyxl.Workbook()
    sheet = workbook.active

    # セルデータとスタイル適用
    for cell_data in cells:
        sheet_cell = sheet.cell(row=cell_data.row, column=cell_data.col, value=cell_data.value)
        if cell_data.id in style_map:
            _apply_cell_style(sheet_cell, style_map[cell_data.id])

    # セル結合適用
    for merge in merges:
        sheet.merge_cells(
            start_row=merge.start_row, start_column=merge.start_col,
            end_row=merge.end_row, end_column=merge.end_col
        )

    # 列幅と行高設定
    for col_dim in column_dims:
        sheet.column_dimensions[get_column_letter(col_dim.col)].width = col_dim.width

    for row_dim in row_dims:
        sheet.row_dimensions[row_dim.row].height = row_dim.height

    # ファイル出力
    output = io.BytesIO()
    workbook.save(output)
    output.seek(0)

    return output


# ============= レスポンス関連関数 =============

# 掲示板投稿をレスポンス形式に整形する
async def format_bulletin_response(post: BulletinPost, employee_name: str, db: Session) -> Dict[str, Any]:
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "employee_id": post.employee_id,
        "employee_name": employee_name,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "filename": post.filename
    }


# 掲示板投稿一覧を取得する
async def get_bulletin_list(skip: int, limit: int, db: Session) -> Dict[str, Any]:
    # 並行してデータ取得
    count_task = asyncio.create_task(_run_in_thread(
        lambda: db.query(BulletinPost).count()
    ))

    # 投稿データをjoinedloadを使って従業員情報と一緒に取得
    posts_task = asyncio.create_task(_run_in_thread(
        lambda: db.query(BulletinPost)
               .options(joinedload(BulletinPost.employee))
               .order_by(BulletinPost.created_at.desc())
               .offset(skip)
               .limit(limit)
               .all()
    ))

    # データ取得を待機
    total_count, posts = await asyncio.gather(count_task, posts_task)

    # レスポンスデータを作成
    posts_data = [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "employee_id": post.employee_id,
            "employee_name": post.employee.name if post.employee else None,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "filename": post.filename
        }
        for post in posts
    ]

    return {
        "posts": posts_data,
        "total": total_count
    }

# エクセルファイルをダウンロードするためのレスポンスを作成する
async def create_excel_response(output: io.BytesIO, filename: str) -> StreamingResponse:
    # ファイル名をURLエンコード
    encoded_filename = urllib.parse.quote(filename)

    # レスポンスの設定
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
    )


# 掲示板投稿の詳細情報を取得する
async def get_bulletin_detail(bulletin_id: int, db: Session) -> Dict[str, Any]:
    # 投稿の取得（employeeとjoinedloadで一緒に取得）
    post = db.query(BulletinPost).options(joinedload(BulletinPost.employee)).filter(BulletinPost.id == bulletin_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID {bulletin_id} の掲示板投稿が見つかりません")

    # 並行して各データを取得
    cells_data, merges_data, column_dimensions_data, row_dimensions_data = await asyncio.gather(
        _fetch_bulletin_cells_with_styles(db, bulletin_id),
        _fetch_bulletin_merges(db, bulletin_id),
        _fetch_bulletin_column_dimensions(db, bulletin_id),
        _fetch_bulletin_row_dimensions(db, bulletin_id)
    )

    employee_name = post.employee.name if post.employee else None

    # レスポンスデータを作成
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "employee_id": post.employee_id,
        "employee_name": employee_name,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "filename": post.filename,
        "cells": cells_data,
        "merges": merges_data,
        "column_dimensions": column_dimensions_data,
        "row_dimensions": row_dimensions_data,
        "exists": True,
        "parsed_at": datetime.now().isoformat()
    }


# ============= データ取得関連関数 =============

# セルデータとスタイル情報を効率的に取得
async def _fetch_bulletin_cells_with_styles(db: Session, bulletin_id: int) -> List[Dict[str, Any]]:
    # セルデータとスタイル情報を並行して取得
    cells = await _run_in_thread(
        lambda: db.query(BulletinCell).filter(BulletinCell.bulletin_id == bulletin_id).all()
    )

    cell_ids = [cell.id for cell in cells]

    if not cell_ids:
        return []

    # joinedloadを使用してセルとスタイルを一緒に取得
    cells_with_styles = await _run_in_thread(
        lambda: db.query(BulletinCell).options(
            joinedload(BulletinCell.style)
        ).filter(
            BulletinCell.id.in_(cell_ids)
        ).all()
    )

    # セルデータを整形
    return [_format_cell_data(cell, cell.style) for cell in cells_with_styles]


# 結合セル情報を取得
async def _fetch_bulletin_merges(db: Session, bulletin_id: int) -> List[Dict[str, Any]]:
    merges = await _run_in_thread(
        lambda: db.query(BulletinMerge).filter(BulletinMerge.bulletin_id == bulletin_id).all()
    )

    return [
        {
            "start": {"row": merge.start_row, "col": merge.start_col},
            "end": {"row": merge.end_row, "col": merge.end_col}
        }
        for merge in merges
    ]


# 列の幅情報を取得
async def _fetch_bulletin_column_dimensions(db: Session, bulletin_id: int) -> Dict[str, float]:
    column_dimensions = await _run_in_thread(
        lambda: db.query(BulletinColumnDimension).filter(
            BulletinColumnDimension.bulletin_id == bulletin_id
        ).all()
    )

    return {str(col_dim.col): col_dim.width for col_dim in column_dimensions}


# 行の高さ情報を取得
async def _fetch_bulletin_row_dimensions(db: Session, bulletin_id: int) -> Dict[str, float]:
    row_dimensions = await _run_in_thread(
        lambda: db.query(BulletinRowDimension).filter(
            BulletinRowDimension.bulletin_id == bulletin_id
        ).all()
    )

    return {str(row_dim.row): row_dim.height for row_dim in row_dimensions}


# ============= ユーティリティ関数 =============

# 色情報をaRGB形式に修正する
def _fix_color_format(color_str):
    if not color_str or not isinstance(color_str, str):
        return None

    # 透明色または空の色
    if color_str == "00000000" or color_str == "":
        return None

    # '#'で始まる場合は削除
    if color_str.startswith('#'):
        color_str = color_str[1:]

    # 形式に応じた処理
    if len(color_str) == 8:
        return color_str
    elif len(color_str) == 6:
        return "FF" + color_str

    # その他は黒色（不透明）
    return "FF000000"


# セルのスタイル情報を解析
def _parse_cell_style(cell) -> Dict[str, Any]:
    style = {}

    # フォント情報
    if cell.font:
        style['font_bold'] = cell.font.bold

        try:
            style['font_color'] = str(cell.font.color.rgb)[:64] if hasattr(cell.font.color, 'rgb') and cell.font.color.rgb else None
        except Exception:
            style['font_color'] = None

        try:
            style['font_size'] = float(cell.font.size) if cell.font.size else None
        except (TypeError, ValueError):
            style['font_size'] = None
    else:
        style['font_bold'] = False
        style['font_color'] = None
        style['font_size'] = None

    # 背景色
    try:
        style['bg_color'] = str(cell.fill.fgColor.rgb)[:64] if cell.fill and hasattr(cell.fill, 'fgColor') and cell.fill.fgColor.rgb else None
    except Exception:
        style['bg_color'] = None

    # 罫線スタイル
    if cell.border:
        for side in ['top', 'right', 'bottom', 'left']:
            border_side = getattr(cell.border, side, None)
            if border_side:
                style[f'border_{side}_style'] = str(border_side.style)[:16] if border_side.style else None
                try:
                    style[f'border_{side}_color'] = str(border_side.color.rgb)[:64] if hasattr(border_side.color, 'rgb') and border_side.color.rgb else None
                except Exception:
                    style[f'border_{side}_color'] = None

    # 配置情報
    if cell.alignment:
        style['alignment_horizontal'] = str(cell.alignment.horizontal)[:16] if cell.alignment.horizontal else None
        style['alignment_vertical'] = str(cell.alignment.vertical)[:16] if cell.alignment.vertical else None

    return style


# セルにスタイルを適用
def _apply_cell_style(cell, style):
    # フォントスタイル設定
    if style.font_bold or style.font_color or style.font_size:
        font_args = {'bold': style.font_bold, 'size': style.font_size}
        if style.font_color:
            fixed_color = _fix_color_format(style.font_color)
            if fixed_color:
                font_args['color'] = fixed_color
        cell.font = Font(**font_args)

    # 背景色設定
    if style.bg_color:
        fixed_bg_color = _fix_color_format(style.bg_color)
        if fixed_bg_color:
            cell.fill = PatternFill(fill_type='solid', fgColor=fixed_bg_color)

    # 罫線設定
    borders = {}
    for side in ['top', 'right', 'bottom', 'left']:
        style_attr = getattr(style, f'border_{side}_style', None)
        if style_attr:
            color_attr = getattr(style, f'border_{side}_color', None)
            color = _fix_color_format(color_attr) if color_attr else None
            borders[side] = Side(style=style_attr, color=color)

    if borders:
        cell.border = Border(**borders)

    # 配置設定
    if style.alignment_horizontal or style.alignment_vertical:
        cell.alignment = Alignment(
            horizontal=style.alignment_horizontal,
            vertical=style.alignment_vertical
        )


# 安全なファイル名を生成
def _generate_safe_filename(post):
    if post.filename:
        # 拡張子保持
        name_part, ext_part = post.filename.rsplit('.', 1) if '.' in post.filename else (post.filename, 'xlsx')
        # ASCII化と特殊文字処理
        ascii_name = unicodedata.normalize('NFKD', name_part).encode('ASCII', 'ignore').decode()
        safe_name = ''.join(c if c.isalnum() or c in '_- ' else '_' for c in ascii_name)
        return f"{safe_name}.{ext_part}"
    else:
        # タイトルからファイル名生成
        ascii_title = unicodedata.normalize('NFKD', post.title).encode('ASCII', 'ignore').decode()
        safe_title = ''.join(c if c.isalnum() or c in '_- ' else '_' for c in ascii_title)
        return f"{safe_title}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"


# セルデータをフロントエンド用にフォーマット
def _format_cell_data(cell, style):
    cell_data = {
        "row": cell.row,
        "col": cell.col,
        "value": cell.value
    }

    # スタイル情報があれば追加
    if style:
        cell_data["style"] = {
            "font": {
                "bold": style.font_bold,
                "color": style.font_color,
                "size": style.font_size
            },
            "fill": {
                "bgColor": style.bg_color
            },
            "border": {
                "top": {
                    "style": style.border_top_style,
                    "color": style.border_top_color
                },
                "right": {
                    "style": style.border_right_style,
                    "color": style.border_right_color
                },
                "bottom": {
                    "style": style.border_bottom_style,
                    "color": style.border_bottom_color
                },
                "left": {
                    "style": style.border_left_style,
                    "color": style.border_left_color
                }
            },
            "alignment": {
                "horizontal": style.alignment_horizontal,
                "vertical": style.alignment_vertical
            }
        }

    return cell_data


# スレッドプールエグゼキューターでCPU負荷の高い処理を実行
async def _run_in_thread(func):
    return await asyncio.get_event_loop().run_in_executor(thread_executor, func)