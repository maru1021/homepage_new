import logging
import os
from logging.handlers import RotatingFileHandler
from contextvars import ContextVar
from backend.handlers.slack_handler import SlackHandler
from backend.scripts.get_time import now

# リクエスト情報を保持するコンテキスト変数
request_context = ContextVar('request_context', default=None)
current_user_context = ContextVar('current_user_context', default=None)

class JSTFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        dt = now()
        if datefmt:
            return dt.strftime(datefmt)
        return dt.strftime('%Y-%m-%d %H:%M:%S')

# ログフィルターを追加して社員番号とセキュリティ情報を自動的に含める
class SecurityInfoFilter(logging.Filter):
    def filter(self, record):
        # リクエスト情報の取得
        request = request_context.get()
        if request:
            # 実際のクライアントIPアドレスの取得
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                # プロキシ経由の場合、最初のIPアドレスが実際のクライアントIP
                record.ip_address = forwarded.split(",")[0].strip()
            else:
                # X-Real-IPヘッダーを確認
                real_ip = request.headers.get("X-Real-IP")
                if real_ip:
                    record.ip_address = real_ip
                else:
                    # 直接接続の場合
                    record.ip_address = request.client.host or "N/A"

            # User-Agentの取得
            record.user_agent = request.headers.get("User-Agent", "N/A")
        else:
            record.ip_address = "N/A"
            record.user_agent = "N/A"

        return True

class Logger:
    # ログファイルのパス設定
    LOG_DIR = os.path.join('backend', 'log')
    SQL_LOG_FILE = os.path.join(LOG_DIR, 'sql.log')
    ERROR_LOG_FILE = os.path.join(LOG_DIR, 'error.log')
    ACCESS_LOG_FILE = os.path.join(LOG_DIR, 'access.log')
    ACCESS_MISS_LOG_FILE = os.path.join(LOG_DIR, 'access_miss.log')
    INVALID_ACCESS_LOG_FILE = os.path.join(LOG_DIR, 'invalid_access.log')

    def __init__(self):
        # ログディレクトリが存在しない場合は作成
        os.makedirs(self.LOG_DIR, exist_ok=True)

    def _setup_logger(self, log_file, level=logging.INFO, format_str=None):
        """共通のロガー設定を行う"""
        logger = logging.getLogger()
        logger.setLevel(level)

        # 既存のハンドラとフィルターをクリア
        logger.handlers = []
        logger.filters = []

        # 現在のユーザー情報を取得
        try:
            current_user = current_user_context.get()
            print('current_user in logger:', current_user)
            if current_user and hasattr(current_user, 'employee_no'):
                employee_no = current_user.employee_no
                print('employee_no in logger:', employee_no)
            else:
                # リクエスト情報からユーザー情報を取得
                request = request_context.get()
                if request and hasattr(request, 'state') and hasattr(request.state, 'user'):
                    current_user = request.state.user
                    if current_user and hasattr(current_user, 'employee_no'):
                        employee_no = current_user.employee_no
                        print('employee_no from request state:', employee_no)
                    else:
                        employee_no = 'N/A'
                else:
                    employee_no = 'N/A'
                print('employee_no not found, using N/A')
        except Exception as e:
            print('Error getting current_user:', str(e))
            employee_no = 'N/A'

        # リクエスト情報を取得
        request = request_context.get()
        ip_address = "N/A"
        user_agent = "N/A"
        if request and hasattr(request, 'headers'):
            # IPアドレスの取得
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                ip_address = forwarded.split(",")[0].strip()
            else:
                real_ip = request.headers.get("X-Real-IP")
                if real_ip:
                    ip_address = real_ip
                elif hasattr(request, 'client'):
                    ip_address = request.client.host

            # User-Agentの取得
            user_agent = request.headers.get("User-Agent", "N/A")

        # ファイルハンドラ設定
        handler = RotatingFileHandler(
            filename=log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        handler.setLevel(level)

        # フォーマッタの設定
        if format_str:
            formatter = JSTFormatter(format_str)
        else:
            # デフォルト用のフォーマット
            formatter = JSTFormatter(
                '%(asctime)s,%(employee_no)s,%(ip_address)s,%(user_agent)s,%(message)s'
            )
        handler.setFormatter(formatter)

        # ハンドラの追加
        logger.addHandler(handler)

        # ログレコードに情報を追加
        extra = {
            'employee_no': employee_no,
            'ip_address': ip_address,
            'user_agent': user_agent
        }

        return logger, extra

    def write_sql_log(self, message, extra=None):
        try:
            logger, default_extra = self._setup_logger(
                self.SQL_LOG_FILE,
                format_str='%(asctime)s,%(employee_no)s,%(ip_address)s,%(message)s'
            )
            # デフォルトのextraと渡されたextraをマージ
            merged_extra = {**default_extra, **(extra or {})}
            logger.info(message, extra=merged_extra)
            logger.handlers = []  # メモリリーク防止
        except Exception as e:
            print(f"SQLログの書き込みに失敗しました: {e}")

    def write_error_log(self, message):
        try:
            logger, extra = self._setup_logger(
                self.ERROR_LOG_FILE,
                level=logging.ERROR,
                format_str='%(asctime)s,%(employee_no)s,%(ip_address)s,%(user_agent)s,%(message)s'
            )

            # Slackハンドラの設定
            slack_token = os.getenv('SLACK_API_TOKEN')
            slack_channel = os.getenv('ERROR_SLACK_CHANNEL', '#エラー通知')
            if slack_token:
                slack_handler = SlackHandler(token=slack_token, channel=slack_channel)
                slack_handler.setLevel(logging.ERROR)
                slack_handler.setFormatter(JSTFormatter(
                    '%(asctime)s,%(employee_no)s,%(ip_address)s,%(user_agent)s,%(message)s'
                ))
                logger.addHandler(slack_handler)

            # エラーメッセージの記録
            logger.error(message, extra=extra)

            # ハンドラをクリア（メモリリーク防止）
            logger.handlers = []
        except Exception as e:
            print(f"エラーログの書き込みに失敗しました: {e}")

    def write_access_log_success(self, message):
        """成功時のアクセスログを記録"""
        try:
            logger, extra = self._setup_logger(
                self.ACCESS_LOG_FILE,
                format_str='%(asctime)s,%(message)s,%(ip_address)s,%(user_agent)s'
            )
            logger.info(message, extra=extra)
            logger.handlers = []  # メモリリーク防止
        except Exception as e:
            print(f"アクセスログ（成功）の書き込みに失敗しました: {e}")

    def write_access_log_miss(self, message):
        """失敗時のアクセスログを記録"""
        try:
            logger, extra = self._setup_logger(
                self.ACCESS_MISS_LOG_FILE,
                format_str='%(asctime)s,%(message)s,%(ip_address)s,%(user_agent)s'
            )
            logger.info(message, extra=extra)
            logger.handlers = []  # メモリリーク防止
        except Exception as e:
            print(f"アクセスログ（失敗）の書き込みに失敗しました: {e}")

    # 後方互換性のために残す
    def write_access_log(self, message, is_success=True):
        """後方互換性のためのメソッド"""
        if is_success:
            self.write_access_log_success(message)
        else:
            self.write_access_log_miss(message)

    def write_invalid_access_log(self, message):
        """不正アクセスログを記録"""
        try:
            logger, extra = self._setup_logger(
                self.INVALID_ACCESS_LOG_FILE,
                format_str='%(asctime)s,%(employee_no)s,%(ip_address)s,%(message)s'
            )
            # リクエスト情報からURLを取得
            request = request_context.get()
            if request:
                url = f"{request.method} {request.url.path}"
                message = f"{message} [URL: {url}]"
            logger.warning(message, extra=extra)
            logger.handlers = []  # メモリリーク防止
        except Exception as e:
            print(f"不正アクセスログの書き込みに失敗しました: {e}")

# グローバルなロガーインスタンスを作成
logger = Logger()
