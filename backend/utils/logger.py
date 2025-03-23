import os
from datetime import datetime

class Logger:
    # ログファイルのパス設定
    LOG_DIR = os.path.join('backend', 'log')
    SQL_LOG_FILE = os.path.join(LOG_DIR, 'sql.log')
    ERROR_LOG_FILE = os.path.join(LOG_DIR, 'error.log')
    ACCESS_LOG_FILE = os.path.join(LOG_DIR, 'access.log')

    # ログディレクトリが存在しない場合は作成
    @classmethod
    def _ensure_log_dir(cls):
        os.makedirs(cls.LOG_DIR, exist_ok=True)

    # SQLログ
    @classmethod
    def write_sql_log(cls, message):
        cls._ensure_log_dir()
        try:
            with open(cls.SQL_LOG_FILE, 'a', encoding='utf-8') as f:
                f.write(message + '\n')
        except Exception as e:
            print(f"SQLログの書き込みに失敗しました: {e}")

    # エラーログ
    @classmethod
    def write_error_log(cls, message):
        cls._ensure_log_dir()
        try:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            error_message = f"[{timestamp}] {message}"
            with open(cls.ERROR_LOG_FILE, 'a', encoding='utf-8') as f:
                f.write(error_message + '\n')
        except Exception as e:
            print(f"エラーログの書き込みに失敗しました: {e}")

    @classmethod
    def write_access_log(cls, message):
        cls._ensure_log_dir()
        try:
            with open(cls.ACCESS_LOG_FILE, 'a', encoding='utf-8') as f:
                f.write(message + '\n')
        except Exception as e:
            print(f"アクセスログの書き込みに失敗しました: {e}")
