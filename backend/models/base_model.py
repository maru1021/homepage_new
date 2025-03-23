from sqlalchemy import event
from backend.models import Base
from backend.scripts.get_time import now
from sqlalchemy.engine import Engine
from backend.utils.logger import Logger
import os

# 最後に実行されたSQLとパラメータを保持
_last_sql = None
_last_params = None

# ログファイルのパス設定
LOG_DIR = os.path.join('backend', 'log')
LOG_FILE = os.path.join(LOG_DIR, 'sql_log.txt')

@event.listens_for(Engine, 'before_cursor_execute')
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    global _last_sql, _last_params
    # INSERT, UPDATE, DELETE操作のみを記録
    if any(statement.strip().upper().startswith(op) for op in ['INSERT', 'UPDATE', 'DELETE']):
        _last_sql = statement
        _last_params = parameters

class BaseModel(Base):
    __abstract__ = True

    def after_commit(self, session, operation_type=None):
        """トランザクションのコミット後の処理"""
        global _last_sql, _last_params
        if operation_type in ['insert', 'update', 'delete']:
            time = now().strftime('%Y-%m-%d %H:%M:%S')
            if _last_sql:  # SQLが記録されている場合のみ出力
                # パラメータを実際の値で置換
                sql = _last_sql
                if _last_params:
                    # 文字列の値をクォートで囲む
                    formatted_params = {}
                    for key, value in _last_params.items():
                        if isinstance(value, str):
                            formatted_params[key] = f"'{value}'"
                        else:
                            formatted_params[key] = value
                    sql = sql % formatted_params

                # INSERT文の場合、生成されたIDを表示
                if operation_type == 'insert':
                    # モデルから直接IDを取得
                    model_id = getattr(self, 'id', None)
                    if model_id is not None:
                        sql = f"{sql} => ID: {model_id}"

                # ログメッセージを作成して出力
                log_message = f"[{time}] [N/A] {sql}"
                Logger.write_sql_log(log_message)

                _last_sql = None
                _last_params = None

    @classmethod
    def __declare_last__(cls):
        """モデルクラス定義時にイベントを登録"""
        for operation in ['insert', 'update', 'delete']:
            event.listen(
                cls,
                f'after_{operation}',
                lambda m, c, t, op=operation: event.listen(
                    t._sa_instance_state.session,
                    'after_commit',
                    lambda s: t.after_commit(s, op),
                    once=True
                )
            )