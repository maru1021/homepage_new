from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# 株価データリクエストのスキーマ
class StockRequest(BaseModel):
    symbol: str
    timeRange: str
    chartType: Optional[str] = "candlestick"
    showSMA5: Optional[bool] = True
    showSMA25: Optional[bool] = True
    showSMA75: Optional[bool] = True
    showBollingerBands: Optional[bool] = True

# 株価データレスポンスのスキーマ
class StockResponse(BaseModel):
    priceData: List[Dict[str, Any]]
    volumeData: List[Dict[str, Any]]
    lastPrice: float
    prevPrice: float
    priceChange: float
    priceChangePercent: float
