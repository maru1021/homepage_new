from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger, Text, Sequence
from sqlalchemy.orm import relationship
from backend.models.base_model import BaseModel

# 項目
class Type(BaseModel):
    __tablename__ = "types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(32), nullable=False)
    sort = Column(Integer, nullable=False)

    classifications = relationship("Classification", back_populates="type", cascade="all, delete-orphan")
    articles = relationship("Article", back_populates="type")


# 分類
class Classification(BaseModel):
    __tablename__ = "classifications"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(32), nullable=False)
    type_id = Column(BigInteger, ForeignKey("types.id", ondelete="CASCADE"), nullable=False)
    sort = Column(Integer, nullable=False)

    type = relationship("Type", back_populates="classifications")
    articles = relationship("Article", back_populates="classification")


# 記事
class Article(BaseModel):
    __tablename__ = "articles"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    type_id = Column(BigInteger, ForeignKey("types.id", ondelete="SET NULL"), nullable=True)
    classification_id = Column(BigInteger, ForeignKey("classifications.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    disp = Column(Text, nullable=True)
    language = Column(String(255), nullable=True)
    code = Column(Text, nullable=True)
    language2 = Column(String(255), nullable=True)
    code2 = Column(Text, nullable=True)
    language3 = Column(String(255), nullable=True)
    code3 = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    sort = Column(Integer, nullable=False)

    type = relationship("Type", back_populates="articles")
    classification = relationship("Classification", back_populates="articles")
