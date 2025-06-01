from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship

from backend.models.base_model import BaseModel, Base
from backend.scripts.get_time import now


# 中間テーブル
# 工具と工具番号の関連付け
tool_tool_no = Table(
    'tool_tool_no',
    Base.metadata,
    Column('tool_id', Integer, ForeignKey('tools.id', ondelete="CASCADE"), primary_key=True),
    Column('tool_no_id', Integer, ForeignKey('tool_nos.id', ondelete="CASCADE"), primary_key=True),
    extend_existing=True
)

# ラインモデル
class Line(BaseModel):
    __tablename__ = "lines"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    register_date = Column(DateTime, default=now)
    name = Column(String(255), index=True)
    active = Column(Boolean, default=True)
    sort = Column(Integer, default=0)
    position_x = Column(Integer, default=0)  # 位置情報X座標
    position_y = Column(Integer, default=0)  # 位置情報Y座標

    machines = relationship("Machine", back_populates="line")
    alarm_histories = relationship("AlarmHistory", back_populates="line")


# 加工機モデル
class Machine(BaseModel):
    __tablename__ = "machines"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    register_date = Column(DateTime, default=now)
    name = Column(String(50), index=True)
    active = Column(Boolean, default=True)
    sort = Column(Integer)
    operating_condition = Column(String(10), default="稼働中")
    line_id = Column(Integer, ForeignKey("lines.id", ondelete="CASCADE"))
    position_x = Column(Integer, default=0)  # 位置情報X座標
    position_y = Column(Integer, default=0)  # 位置情報Y座標

    line = relationship("Line", back_populates="machines")
    tool_nos = relationship("ToolNo", back_populates="machine")
    alarm_histories = relationship("AlarmHistory", back_populates="machine")


# 工具番号モデル
class ToolNo(BaseModel):
    __tablename__ = "tool_nos"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    register_date = Column(DateTime, default=now)
    name = Column(String(50), index=True)
    active = Column(Boolean, default=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"))

    machine = relationship("Machine", back_populates="tool_nos")
    tools = relationship("Tool", secondary=tool_tool_no, back_populates="tool_nos")
    alarm_histories = relationship("AlarmHistory", back_populates="tool_no")


# 工具モデル
class Tool(BaseModel):
    __tablename__ = "tools"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    register_date = Column(DateTime, default=now)
    name = Column(String(50), index=True)
    active = Column(Boolean, default=True)
    sort = Column(Integer)
    tool_nos = relationship("ToolNo", secondary=tool_tool_no, back_populates="tools")


# アラームモデル
class Alarm(BaseModel):
    __tablename__ = "alarms"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    register_date = Column(DateTime, default=now)
    name = Column(String(50), index=True)
    active = Column(Boolean, default=True)
    sort = Column(Integer)

    alarm_histories = relationship("AlarmHistory", back_populates="alarm")


# アラーム履歴モデル
class AlarmHistory(BaseModel):
    __tablename__ = "alarm_histories"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    stop_time = Column(DateTime, default=now)
    restart_time = Column(DateTime)
    alarm_id = Column(Integer, ForeignKey("alarms.id", ondelete="CASCADE"))
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"))
    line_id = Column(Integer, ForeignKey("lines.id", ondelete="CASCADE"))
    tool_no_id = Column(Integer, ForeignKey("tool_nos.id", ondelete="CASCADE"))

    alarm = relationship("Alarm", back_populates="alarm_histories")
    machine = relationship("Machine", back_populates="alarm_histories")
    line = relationship("Line", back_populates="alarm_histories")
    tool_no = relationship("ToolNo", back_populates="alarm_histories")