from pydantic import BaseModel
from typing import List


# 登録時の形式
class ClassificationCreate(BaseModel):
    name: str
    type_id: int

    class Config:
        from_attributes = True

# 編集時の形式
class ClassificationUpdate(BaseModel):
    name: str
    type_id: int

    class Config:
        from_attributes = True


# テーブルのデータ取得時の形式
class Classification(BaseModel):
    id: int
    name: str
    sort: int
    type_id: int
    type_name: str

    class Config:
        from_attributes = True

class PaginatedClassificationResponse(BaseModel):
    classifications: List[Classification]
    totalCount: int

# Post時の返す形式
class ClassificationResponse(BaseModel):
    success: bool = True
    message: str
    field: str = ''

    class Config:
        from_attributes = True
