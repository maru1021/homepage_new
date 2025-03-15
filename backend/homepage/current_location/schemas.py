from pydantic import BaseModel
from typing import Optional

class LocationInfo(BaseModel):
    ip: str
    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    isp: Optional[str] = None

# ブラウザから送信される位置情報を受け取るためのモデル
class BrowserLocation(BaseModel):
    latitude: float
    longitude: float

# 位置情報レスポンス用のモデル
class BrowserLocationResponse(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None

# 天気情報のレスポンスモデル
class WeatherInfo(BaseModel):
    temperature: float
    condition: str
    humidity: int
    windSpeed: float
    icon: str