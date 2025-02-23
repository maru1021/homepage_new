from pydantic import BaseModel
from typing import List


# 登録時の形式
class TypeCreate(BaseModel):
    name: str

    class Config:
        from_attributes = True

# 編集時の形式
class TypeUpdate(BaseModel):
    name: str

    class Config:
        from_attributes = True


# テーブルのデータ取得時の形式
class Type(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class PaginatedTypeResponse(BaseModel):
    types: List[Type]
    totalCount: int

# Post時の返す形式
class TypeResponse(BaseModel):
    success: bool = True
    message: str
    field: str = ''

    class Config:
        from_attributes = True
