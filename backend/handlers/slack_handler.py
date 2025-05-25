import logging
import requests
from typing import Dict, Any
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

class SlackHandler(logging.Handler):
    def __init__(self, token: str, channel: str):
        super().__init__()
        self.client = WebClient(token=token)
        self.channel = channel

    def emit(self, record: logging.LogRecord):
        try:
            # ログレコードからメッセージを取得
            msg = self.format(record)

            # Slackに送信するメッセージを構築
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🚨 {record.levelname} が発生しました"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*時間:*\n{record.asctime}"
                        },
                    ]
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*社員番号:*\n{getattr(record, 'employee_no', 'N/A')}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*IPアドレス:*\n{getattr(record, 'ip_address', 'N/A')}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*メッセージ:*\n```{msg}```"
                    }
                }
            ]

            # Slackに送信
            self.client.chat_postMessage(
                channel=self.channel,
                blocks=blocks,
                text=f"{record.levelname}: {msg}"  # フォールバックテキスト
            )
        except SlackApiError as e:
            print(f"Slack送信エラー: {str(e)}")
        except Exception as e:
            print(f"予期せぬエラー: {str(e)}")