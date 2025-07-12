from fastapi import HTTPException
import time
from fastapi import APIRouter

from backend.utils.logger import logger
from backend.homepage.stock_chart.schemas import StockRequest, StockResponse
from backend.homepage.stock_chart.get_chart_data import get_cache_key, fetch_forex_data, fetch_japan_stock_data


CACHE = {}
CACHE_EXPIRY = 60 * 60  # キャッシュの有効期間（秒）

# 日本の主要株価指数の基本データ
JAPAN_INDICES = {
    "N225": {
        "name": "日経平均株価",
        "current_price": 38500,
        "change_rate": 0.3,  # 前日比変化率の目安(%)
        "volatility": 1.2,  # 価格変動の激しさの目安(%)
    },
    "TOPIX": {
        "name": "東証株価指数",
        "current_price": 2650,
        "change_rate": 0.25,
        "volatility": 1.0,
    }
}

# 日本株の主要銘柄の基本データ
JAPAN_STOCKS = {
    "7203.T": {
        "name": "トヨタ自動車",
        "current_price": 2800,
        "change_rate": 0.5,
        "volatility": 1.5,
    },
    "9984.T": {
        "name": "ソフトバンクグループ",
        "current_price": 6700,
        "change_rate": 0.8,
        "volatility": 2.0,
    },
    "6758.T": {
        "name": "ソニーグループ",
        "current_price": 12800,
        "change_rate": 0.6,
        "volatility": 1.8,
    },
    "8306.T": {
        "name": "三菱UFJフィナンシャル",
        "current_price": 1230,
        "change_rate": 0.4,
        "volatility": 1.3,
    }
}

# 為替レートのシンボル
FOREX_SYMBOLS = {
    "USDJPY": {"name": "米ドル/円", "base": "USD", "quote": "JPY"},
    "EURJPY": {"name": "ユーロ/円", "base": "EUR", "quote": "JPY"},
    "GBPJPY": {"name": "英ポンド/円", "base": "GBP", "quote": "JPY"},
    "EURUSD": {"name": "ユーロ/米ドル", "base": "EUR", "quote": "USD"},
    "GBPUSD": {"name": "英ポンド/米ドル", "base": "GBP", "quote": "USD"}
}

router = APIRouter()

@router.post("/stock-data", response_model=StockResponse)
async def get_stock_data(request: StockRequest):
    try:

        # キャッシュのチェック
        cache_key = get_cache_key(request.symbol, request.timeRange)

        if cache_key in CACHE and CACHE[cache_key]["expiry"] > time.time():
            return CACHE[cache_key]["data"]

        # 為替データの場合
        if request.symbol in FOREX_SYMBOLS:
            try:
                data = fetch_forex_data(request.symbol, request.timeRange)

                CACHE[cache_key] = {
                    "data": data,
                    "expiry": time.time() + CACHE_EXPIRY
                }

                return data
            except Exception as forex_error:
                logger.write_error_log(
                    f"Error in get_stock_data: {str(forex_error)}\n"
                    f"Function: get_stock_data\n"
                    f"Symbol: {request.symbol}\n"
                    f"Time Range: {request.timeRange}"
                )

        # 日本株データの場合
        if request.symbol in JAPAN_INDICES or request.symbol in JAPAN_STOCKS or '.T' in request.symbol:
            try:
                # 日本株データの取得を試みる
                data = fetch_japan_stock_data(request.symbol, request.timeRange)

                CACHE[cache_key] = {
                    "data": data,
                    "expiry": time.time() + CACHE_EXPIRY
                }

                return data
            except Exception as jp_error:
                logger.write_error_log(
                    f"Error in get_stock_data: {str(jp_error)}\n"
                    f"Function: get_stock_data\n"
                    f"Symbol: {request.symbol}\n"
                    f"Time Range: {request.timeRange}"
                )

    except Exception as e:
        logger.write_error_log(
            f"Error in get_stock_data: {str(e)}\n"
            f"Function: get_stock_data\n"
            f"Symbol: {request.symbol}\n"
            f"Time Range: {request.timeRange}"
        )
        raise HTTPException(status_code=500, detail=str(e))
