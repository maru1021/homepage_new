from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# 投稿作成用スキーマ
class BulletinPostCreate(BaseModel):
    title: str = Field(..., description="掲示板投稿のタイトル")
    content: Optional[str] = Field(None, description="掲示板投稿の内容（任意）")
    employee_id: int = Field(..., description="投稿者の従業員ID")

# 基本的な投稿情報のスキーマ
class BulletinPostBase(BaseModel):
    id: int
    title: str
    content: Optional[str]
    employee_id: int
    employee_name: Optional[str]
    created_at: datetime
    updated_at: datetime
    filename: Optional[str]

    class Config:
        orm_mode = True

# 投稿レスポース用スキーマ
class BulletinPostResponse(BulletinPostBase):
    pass

# 一覧表示用スキーマ
class BulletinListResponse(BaseModel):
    posts: List[BulletinPostBase]
    total: int

# セルスタイル情報
class CellStyle(BaseModel):
    font: Dict[str, Any]
    fill: Dict[str, Any]
    border: Dict[str, Any]
    alignment: Dict[str, Any]

# セル情報
class CellData(BaseModel):
    row: int
    col: int
    value: Optional[str]
    style: Optional[CellStyle] = None

# セル結合情報
class MergeInfo(BaseModel):
    start: Dict[str, int]
    end: Dict[str, int]

# 詳細表示用スキーマ
class BulletinDetailResponse(BulletinPostBase):
    cells: List[CellData]
    merges: List[MergeInfo]
    column_dimensions: Dict[str, float]
    row_dimensions: Dict[str, float]
    exists: bool
    parsed_at: str