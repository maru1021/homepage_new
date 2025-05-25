import logging
import os
from pathlib import Path
from logging.handlers import RotatingFileHandler
from backend.models.base_model import current_user_context
from contextvars import ContextVar
from typing import Optional, Dict, Any
from backend.handlers.slack_handler import SlackHandler
from backend.scripts.get_time import now

# リクエスト情報を保持するコンテキスト変数
request_context = ContextVar('request_context', default=None)

class JSTFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        dt = now()
        if datefmt:
            return dt.strftime(datefmt)
        return dt.strftime('%Y-%m-%d %H:%M:%S')

def setup_logger():
    # ログディレクトリの作成
    log_dir = Path('backend/log')
    log_dir.mkdir(parents=True, exist_ok=True)

    # ロガーの設定
    logger = logging.getLogger()
    logger.setLevel(logging.ERROR)

    # ファイルハンドラの設定（ログローテーション追加）
    file_handler = RotatingFileHandler(
        filename=log_dir / 'error.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.ERROR)

    # フォーマッタの設定（社員番号とセキュリティ情報を追加）
    formatter = JSTFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - '
        '[社員番号: %(employee_no)s] - '
        '[IP: %(ip_address)s] - '
        '[User-Agent: %(user_agent)s] - '
        '%(message)s'
    )
    file_handler.setFormatter(formatter)

    # Slackハンドラの設定
    slack_token = os.getenv('SLACK_API_TOKEN')
    slack_channel = os.getenv('ERROR_SLACK_CHANNEL', '#エラー通知')
    if slack_token:
        slack_handler = SlackHandler(token=slack_token, channel=slack_channel)
        slack_handler.setLevel(logging.ERROR)
        slack_handler.setFormatter(formatter)
        logger.addHandler(slack_handler)
    else:
        logger.warning("Slack APIトークンが設定されていないため、Slack通知は無効です")

    # ファイルハンドラを追加
    logger.addHandler(file_handler)

    return logger

# グローバルなロガーインスタンスを作成
logger = setup_logger()

# ログフィルターを追加して社員番号とセキュリティ情報を自動的に含める
class SecurityInfoFilter(logging.Filter):
    def filter(self, record):
        # 社員番号の取得
        record.employee_no = current_user_context.get().employee_no or "N/A"

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

# フィルターをロガーに追加
logger.addFilter(SecurityInfoFilter())