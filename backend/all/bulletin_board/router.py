from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import logging
import io
import traceback

from backend.models import get_db
from backend.all.bulletin_board import excel_service
from backend.utils.auth_service import authenticate_user, authenticate_and_authorize_post_owner
from backend.all.models import BulletinPost
from backend.all.bulletin_board.schemas import BulletinPostResponse, BulletinListResponse, BulletinDetailResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# ダウンロードパスのプレフィックス
DOWNLOAD_PATH_PREFIX = "/api/all/bulletin_board/download"


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
    current_user = await authenticate_user(request, db)

    # ファイル形式をチェック
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Excel形式のファイルをアップロードしてください")

    try:
        # ファイルの内容を読み込み
        contents = await file.read()

        # ExcelServiceを使ってファイルをパースしデータベースに保存
        bulletin_post = await excel_service.parse_excel_to_db(
            io.BytesIO(contents),
            file.filename,
            current_user.id,  # 認証されたユーザーIDを使用
            title,
            content,
            db
        )

        # 投稿データをレスポンス用に整形
        return await excel_service.format_bulletin_response(bulletin_post, current_user.name, db)

    except Exception as e:
        logger.error(f"エラー発生: {str(e)}")
        logger.error(traceback.format_exc())  # スタックトレースも記録
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"ファイル処理中にエラーが発生しました: {str(e)}")


# 掲示板投稿一覧を取得
@router.get("/list", response_model=BulletinListResponse)
async def get_bulletin_list(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    # 認証確認
    await authenticate_user(request, db)

    try:
        # 投稿一覧を取得
        return await excel_service.get_bulletin_list(skip, limit, db)

    except Exception as e:
        logger.error(f"掲示板リスト取得エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"掲示板リストの取得中にエラーが発生しました: {str(e)}")


# 掲示板データからエクセルファイルを生成してダウンロード
@router.get("/download/{bulletin_id}")
async def download_bulletin_excel(
    bulletin_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    # 認証確認
    await authenticate_user(request, db)

    try:
        # Excelファイルを生成
        output, filename = await excel_service.generate_excel_from_db(bulletin_id, db)

        # レスポンスの設定
        return await excel_service.create_excel_response(output, filename)

    except Exception as e:
        logger.error(f"エクセル生成エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"エクセルファイルの生成中にエラーが発生しました: {str(e)}")


# 掲示板投稿の詳細情報を取得
@router.get("/{bulletin_id}", response_model=BulletinDetailResponse)
async def get_bulletin_detail(
    bulletin_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    # 認証確認
    await authenticate_user(request, db)

    try:
        # 投稿詳細を取得
        return await excel_service.get_bulletin_detail(bulletin_id, db)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"掲示板詳細取得エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"掲示板詳細の取得中にエラーが発生しました: {str(e)}")


# 掲示板投稿を更新する
@router.put("/{bulletin_id}/update", response_model=BulletinPostResponse)
async def update_bulletin_post(
    bulletin_id: int,
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(...),
    content: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # 掲示板投稿を取得
    post = db.query(BulletinPost).filter(BulletinPost.id == bulletin_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID {bulletin_id} の掲示板投稿が見つかりません")

    # 認証と投稿所有者の確認
    current_user = await authenticate_and_authorize_post_owner(request, db, post, admin_override=True)

    # ファイル形式をチェック
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Excel形式のファイルをアップロードしてください")

    try:
        # ファイルの内容を読み込み
        contents = await file.read()

        # 更新処理
        updated_post = await excel_service.update_excel_in_db(
            bulletin_id,
            io.BytesIO(contents),
            file.filename,
            title,
            content,
            db
        )

        # 投稿データをレスポンス用に整形
        return await excel_service.format_bulletin_response(updated_post, current_user.name, db)

    except Exception as e:
        db.rollback()
        logger.error(f"更新エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"更新中にエラーが発生しました: {str(e)}")


# 掲示板投稿を削除する
@router.delete("/{bulletin_id}", response_model=dict)
async def delete_bulletin_post(
    bulletin_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    # 掲示板投稿を取得
    post = db.query(BulletinPost).filter(BulletinPost.id == bulletin_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ID {bulletin_id} の掲示板投稿が見つかりません")

    # 認証と投稿所有者の確認
    await authenticate_and_authorize_post_owner(request, db, post, admin_override=True)

    try:
        # 投稿を削除
        db.delete(post)
        db.commit()
        return {"message": "掲示板投稿が正常に削除されました"}

    except Exception as e:
        db.rollback()
        logger.error(f"削除エラー: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"削除中にエラーが発生しました: {str(e)}")