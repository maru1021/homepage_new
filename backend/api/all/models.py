from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.models.base_model import BaseModel
from backend.api.general.models import Employee

from backend.scripts.get_time import now

# 掲示板投稿テーブル
class BulletinPost(BaseModel):
    __tablename__ = "bulletin_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)  # author_id から employee_id に変更
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)
    file_path = Column(String(255), nullable=True)  # 元のExcelファイルパス
    filename = Column(String(255), nullable=True)   # 元のExcelファイル名

    # リレーションシップ
    employee = relationship("Employee", back_populates="bulletin_posts")  # author から employee に変更
    cells = relationship("BulletinCell", back_populates="bulletin_post", cascade="all, delete-orphan")
    merges = relationship("BulletinMerge", back_populates="bulletin_post", cascade="all, delete-orphan")
    column_dimensions = relationship("BulletinColumnDimension", back_populates="bulletin_post", cascade="all, delete-orphan")
    row_dimensions = relationship("BulletinRowDimension", back_populates="bulletin_post", cascade="all, delete-orphan")
    images = relationship("BulletinImage", back_populates="bulletin_post", cascade="all, delete-orphan")


# 掲示板のセルデータテーブル
class BulletinCell(BaseModel):
    __tablename__ = "bulletin_cells"

    id = Column(Integer, primary_key=True, index=True)
    bulletin_id = Column(Integer, ForeignKey("bulletin_posts.id"), nullable=False)
    row = Column(Integer, nullable=False)
    col = Column(Integer, nullable=False)
    value = Column(Text, nullable=True)

    # リレーションシップ
    bulletin_post = relationship("BulletinPost", back_populates="cells")
    style = relationship("CellStyle", back_populates="cell", uselist=False, cascade="all, delete-orphan", single_parent=True)

    # 複合インデックス（掲示板ID、行、列の組み合わせでユニーク）
    __table_args__ = (
        UniqueConstraint('bulletin_id', 'row', 'col', name='uix_cell_position'),
    )


# 掲示板のセルスタイルテーブル
class CellStyle(BaseModel):
    __tablename__ = "cell_styles"

    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(Integer, ForeignKey("bulletin_cells.id"), nullable=False, unique=True)

    # フォント関連
    font_bold = Column(Boolean, default=False)
    font_color = Column(String(64), nullable=True)
    font_size = Column(Float, nullable=True)

    # 背景色
    bg_color = Column(String(64), nullable=True)

    # 罫線（各方向ごとにスタイルと色）
    border_top_style = Column(String(16), nullable=True)
    border_top_color = Column(String(64), nullable=True)
    border_right_style = Column(String(16), nullable=True)
    border_right_color = Column(String(64), nullable=True)
    border_bottom_style = Column(String(16), nullable=True)
    border_bottom_color = Column(String(64), nullable=True)
    border_left_style = Column(String(16), nullable=True)
    border_left_color = Column(String(64), nullable=True)

    # 配置
    alignment_horizontal = Column(String(16), nullable=True)
    alignment_vertical = Column(String(16), nullable=True)

    # リレーションシップ
    cell = relationship("BulletinCell", back_populates="style")


# 掲示板のセル結合情報テーブル
class BulletinMerge(BaseModel):
    __tablename__ = "bulletin_merges"

    id = Column(Integer, primary_key=True, index=True)
    bulletin_id = Column(Integer, ForeignKey("bulletin_posts.id"), nullable=False)
    start_row = Column(Integer, nullable=False)
    start_col = Column(Integer, nullable=False)
    end_row = Column(Integer, nullable=False)
    end_col = Column(Integer, nullable=False)

    # リレーションシップ
    bulletin_post = relationship("BulletinPost", back_populates="merges")


# 掲示板の列の幅情報テーブル
class BulletinColumnDimension(BaseModel):
    __tablename__ = "bulletin_column_dimensions"

    id = Column(Integer, primary_key=True, index=True)
    bulletin_id = Column(Integer, ForeignKey("bulletin_posts.id"), nullable=False)
    col = Column(Integer, nullable=False)
    width = Column(Float, nullable=False, default=8.43)  # Excelのデフォルト値

    # リレーションシップ
    bulletin_post = relationship("BulletinPost", back_populates="column_dimensions")

    # 複合インデックス
    __table_args__ = (
        UniqueConstraint('bulletin_id', 'col', name='uix_column_dimension'),
    )

# 掲示板の行の高さ情報テーブル
class BulletinRowDimension(BaseModel):
    __tablename__ = "bulletin_row_dimensions"

    id = Column(Integer, primary_key=True, index=True)
    bulletin_id = Column(Integer, ForeignKey("bulletin_posts.id"), nullable=False)
    row = Column(Integer, nullable=False)
    height = Column(Float, nullable=False, default=15)  # Excelのデフォルト値

    # リレーションシップ
    bulletin_post = relationship("BulletinPost", back_populates="row_dimensions")

    # 複合インデックス
    __table_args__ = (
        UniqueConstraint('bulletin_id', 'row', name='uix_row_dimension'),
    )


# 掲示板の画像データテーブル
class BulletinImage(BaseModel):
    __tablename__ = "bulletin_images"

    id = Column(Integer, primary_key=True, index=True)
    bulletin_id = Column(Integer, ForeignKey("bulletin_posts.id"), nullable=False)
    image_data = Column(Text, nullable=True)  # Base64エンコードされた画像データ
    image_type = Column(String(64), nullable=True)  # 画像の種類（例：png, jpeg）

    # 画像の位置情報
    from_row = Column(Integer, nullable=False)
    from_col = Column(Integer, nullable=False)
    to_row = Column(Integer, nullable=False)
    to_col = Column(Integer, nullable=False)

    # サイズと表示情報
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)

    bulletin_post = relationship("BulletinPost", back_populates="images")