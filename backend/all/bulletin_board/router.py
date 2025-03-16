# routers/bulletin_board.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form, status, Request
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import logging
import traceback
import io
import urllib.parse
from datetime import datetime

from backend.models import get_db
from backend.all.bulletin_board.excel_service import ExcelService
from backend.all.models import BulletinPost, BulletinCell, CellStyle, BulletinMerge
from backend.all.models import BulletinColumnDimension, BulletinRowDimension
from backend.all.bulletin_board.schemas import BulletinPostCreate, BulletinPostResponse, BulletinListResponse, BulletinDetailResponse
from backend.auth import verify_token, oauth2_scheme
from backend.general.models import Employee

router = APIRouter()

# ダウンロードパスのプレフィックス
DOWNLOAD_PATH_PREFIX = "/api/all/bulletin_board/download"

# ロガーの設定
logger = logging.getLogger(__name__)

# 認証エラーハンドラ
async def get_current_user_or_none(request: Request, db: Session = Depends(get_db)):
    """
    認証済みユーザーを取得するか、認証エラー時はNoneを返す
    """
    try:
        # CookieからJWTトークンを取得
        access_token = request.cookies.get("access_token")
        if not access_token:
            return None

        # トークンを検証（verify_token関数は自分で実装する必要あり）
        user = await verify_token(access_token, db)
        return user
    except:
        return None

# エクセルファイルをアップロードして掲示板投稿
@router.post("/upload-excel", response_model=BulletinPostResponse)
async def upload_excel(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(...),
    content: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # 認証確認
    current_user = await get_current_user_or_none(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました。再ログインしてください。"
        )

    # ファイル形式をチェック
    print(file.filename)
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel形式のファイルをアップロードしてください")

    try:
        # ファイルの内容を読み込み
        contents = await file.read()

        # 認証済みユーザーのIDを使用
        employee_id = current_user.id

        # ExcelServiceを使ってファイルをパースしデータベースに保存
        bulletin_post = await ExcelService.parse_excel_to_db(
            io.BytesIO(contents),
            file.filename,
            employee_id,  # 認証されたユーザーIDを使用
            title,
            content,
            db
        )

        # 投稿データをレスポンス用に整形
        return {
            "id": bulletin_post.id,
            "title": bulletin_post.title,
            "content": bulletin_post.content,
            "employee_id": bulletin_post.employee_id,
            "employee_name": current_user.name,  # 現在のユーザー名を使用
            "created_at": bulletin_post.created_at,
            "updated_at": bulletin_post.updated_at,
            "filename": bulletin_post.filename
        }

    except Exception as e:
        logger.error(f"エラー発生: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"ファイル処理中にエラーが発生しました: {str(e)}")

@router.get("/list", response_model=BulletinListResponse)
async def get_bulletin_list(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """掲示板投稿の一覧を取得"""
    # 認証確認
    current_user = await get_current_user_or_none(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました。再ログインしてください。"
        )

    try:
        # 総投稿数を取得
        total_count = db.query(BulletinPost).count()

        # 投稿一覧を取得（ページネーション付き）
        posts = db.query(BulletinPost).order_by(BulletinPost.created_at.desc()).offset(skip).limit(limit).all()

        # レスポンスデータを作成
        posts_data = []
        for post in posts:
            # 投稿者の情報を取得（通常はデータベースから関連付けで取得）
            employee = db.query(Employee).filter(Employee.id == post.employee_id).first()
            employee_name = employee.name if employee else None

            posts_data.append({
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "employee_id": post.employee_id,
                "employee_name": employee_name,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
                "filename": post.filename
            })

        return {
            "posts": posts_data,
            "total": total_count
        }

    except Exception as e:
        logger.error(f"掲示板リスト取得エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"掲示板リストの取得中にエラーが発生しました: {str(e)}")

@router.get("/download/{bulletin_id}")
async def download_bulletin_excel(
    bulletin_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """掲示板データからエクセルファイルを生成してダウンロード"""
    # 認証確認
    current_user = await get_current_user_or_none(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました。再ログインしてください。"
        )

    try:
        # ExcelServiceを使ってエクセルファイルを生成
        output, filename = await ExcelService.generate_excel_from_db(bulletin_id, db)

        # ファイル名をURLエンコード
        encoded_filename = urllib.parse.quote(filename)

        # レスポンスの設定
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
        )
    except Exception as e:
        logger.error(f"エクセル生成エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"エクセルファイルの生成中にエラーが発生しました: {str(e)}")

@router.get("/{bulletin_id}", response_model=BulletinDetailResponse)
async def get_bulletin_detail(
    bulletin_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """掲示板投稿の詳細情報を取得"""
    # 認証確認
    current_user = await get_current_user_or_none(request, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証に失敗しました。再ログインしてください。"
        )

    try:
        # 投稿の取得
        post = db.query(BulletinPost).filter(BulletinPost.id == bulletin_id).first()
        if not post:
            raise HTTPException(status_code=404, detail=f"ID {bulletin_id} の掲示板投稿が見つかりません")

        # 投稿者の情報を取得
        employee = db.query(Employee).filter(Employee.id == post.employee_id).first()
        employee_name = employee.name if employee else None

        # セルデータの取得
        cells = db.query(BulletinCell).filter(BulletinCell.bulletin_id == bulletin_id).all()

        # セルIDのリスト
        cell_ids = [cell.id for cell in cells]

        # スタイル情報の取得
        styles = db.query(CellStyle).filter(CellStyle.cell_id.in_(cell_ids)).all()

        # スタイル情報をセルIDをキーにしたマップに変換
        style_map = {style.cell_id: style for style in styles}

        # セルデータを整形
        cells_data = []
        for cell in cells:
            style = style_map.get(cell.id)

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

            cells_data.append(cell_data)

        # セル結合情報の取得
        merges = db.query(BulletinMerge).filter(BulletinMerge.bulletin_id == bulletin_id).all()
        merges_data = [
            {
                "start": {"row": merge.start_row, "col": merge.start_col},
                "end": {"row": merge.end_row, "col": merge.end_col}
            }
            for merge in merges
        ]

        # 列の幅情報
        column_dimensions = db.query(BulletinColumnDimension).filter(
            BulletinColumnDimension.bulletin_id == bulletin_id
        ).all()
        column_dimensions_data = {str(col_dim.col): col_dim.width for col_dim in column_dimensions}

        # 行の高さ情報
        row_dimensions = db.query(BulletinRowDimension).filter(
            BulletinRowDimension.bulletin_id == bulletin_id
        ).all()
        row_dimensions_data = {str(row_dim.row): row_dim.height for row_dim in row_dimensions}

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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"掲示板詳細取得エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"掲示板詳細の取得中にエラーが発生しました: {str(e)}")