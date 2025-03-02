from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.scripts.get_time import now


# テーブルのデータ取得時の形式
class Article(BaseModel):
    id: int
    title: str
    disp: Optional[str] = None
    language: Optional[str] = None
    code: Optional[str] = None
    language2: Optional[str] = None
    code2: Optional[str] = None
    language3: Optional[str] = None
    code3: Optional[str] = None
    explanation: Optional[str] = None
    type_name: Optional[str] = None
    classification_name: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleCreate(BaseModel):
    title: str
    disp: Optional[str] = None
    language: Optional[str] = None
    code: Optional[str] = None
    language2: Optional[str] = None
    code2: Optional[str] = None
    language3: Optional[str] = None
    code3: Optional[str] = None
    explanation: Optional[str] = None
    type_id: int
    classification_id: int
    sort: int = 0  # デフォルト値を0に設定
    created_at: datetime = now()  # 作成日時
    updated_at: datetime = now()  # 更新日時
