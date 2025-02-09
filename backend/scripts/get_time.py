from datetime import datetime
from zoneinfo import ZoneInfo


JST = ZoneInfo("Asia/Tokyo")

def now():
    return datetime.now(JST)

def today():
    return datetime.now(JST).date()