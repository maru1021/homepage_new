from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# タイムゾーン設定
JST = ZoneInfo("Asia/Tokyo")

def now():
    return datetime.now(JST)