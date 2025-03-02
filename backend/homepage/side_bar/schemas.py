from pydantic import BaseModel
from typing import List, Optional

class ArticleBase(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True

class ClassificationWithArticles(BaseModel):
    id: int
    name: str
    articles: List[ArticleBase]

    class Config:
        from_attributes = True

class TypeWithClassifications(BaseModel):
    id: int
    name: str
    classifications: List[ClassificationWithArticles]

    class Config:
        from_attributes = True

class SideBarResponse(BaseModel):
    types: List[TypeWithClassifications]

    class Config:
        from_attributes = True
