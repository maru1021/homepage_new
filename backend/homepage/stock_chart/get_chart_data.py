import requests
from fastapi import HTTPException
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import os
from io import StringIO
import time

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

# レート制限対策のためのキャッシュ
CACHE = {}
CACHE_EXPIRY = 60 * 60  # キャッシュの有効期間（秒）- 1時間

# 為替レートのシンボル
FOREX_SYMBOLS = {
    "USDJPY": {"name": "米ドル/円", "base": "USD", "quote": "JPY"},
    "EURJPY": {"name": "ユーロ/円", "base": "EUR", "quote": "JPY"},
    "GBPJPY": {"name": "英ポンド/円", "base": "GBP", "quote": "JPY"},
    "EURUSD": {"name": "ユーロ/米ドル", "base": "EUR", "quote": "USD"},
    "GBPUSD": {"name": "英ポンド/米ドル", "base": "GBP", "quote": "USD"}
}

# キャッシュキーを生成
def get_cache_key(symbol, time_range):
    return f"{symbol}_{time_range}"

# APIレスポンスをキャッシュするデコレータ
def cache_response(func):
    def wrapper(symbol, time_range, *args, **kwargs):
        cache_key = get_cache_key(symbol, time_range)
        current_time = time.time()

        # キャッシュデータがあり、有効期限内なら使用
        if cache_key in CACHE and current_time - CACHE[cache_key]["timestamp"] < CACHE_EXPIRY:
            return CACHE[cache_key]["data"]

        # なければ関数を実行
        result = func(symbol, time_range, *args, **kwargs)

        # 結果をキャッシュ
        CACHE[cache_key] = {"data": result, "timestamp": current_time}
        return result

    return wrapper

# データフレーム処理ユーティリティ
def process_stock_dataframe(df, start_date):
    """共通のデータフレーム処理を行うユーティリティ関数"""
    # 必要なカラムがあるか確認
    required_cols = ['open', 'high', 'low', 'close']
    for col in required_cols:
        if col not in df.columns:
            return None

    # 数値型に変換
    for col in required_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # volumeカラムが存在しなければダミー値を追加
    if 'volume' not in df.columns:
        df['volume'] = 1000000
    else:
        df['volume'] = pd.to_numeric(df['volume'], errors='coerce').fillna(0).astype(int)

    # 欠損値を削除
    df = df.dropna(subset=required_cols)

    # 日付でソート
    df = df.sort_index()

    # 時間範囲でフィルタリング
    if start_date:
        start_date_str = start_date.strftime("%Y-%m-%d")
        df = df[df.index >= start_date_str]

    # 上昇/下降を一度に計算
    df['is_up'] = df['close'] >= df['open']

    # 条件に基づく値の割り当てをベクトル化
    df['color'] = np.where(df['is_up'], "#26A69A", "#EF5350")
    df['bodyStart'] = np.where(df['is_up'], df['open'], df['close'])
    df['bodyEnd'] = np.where(df['is_up'], df['close'], df['open'])

    return df

# テクニカル指標を最適化計算
def calculate_indicators_optimized(df):
    """テクニカル指標をベクトル化計算するための関数"""
    if df.empty:
        return df

    # ウィンドウサイズのリスト
    sma_windows = [5, 25, 75]

    # 一度に複数の移動平均を計算
    for window in sma_windows:
        df[f'sma{window}'] = df['close'].rolling(window=window).mean()

    # ボリンジャーバンドの標準偏差を一度だけ計算
    rolling_std = df['close'].rolling(window=25).std()

    # 標準偏差倍率のリスト
    std_multipliers = [2, 3]

    # 複数のボリンジャーバンドを一度に計算
    for multiplier in std_multipliers:
        suffix = '' if multiplier == 2 else str(multiplier)
        df[f'upperBand{suffix}'] = df['sma25'] + (rolling_std * multiplier)
        df[f'lowerBand{suffix}'] = df['sma25'] - (rolling_std * multiplier)

    return df

# データフレームを処理して必要な応答形式に変換
def prepare_stock_response(df):
    """データフレームからAPIレスポンス形式に変換する関数"""
    if df.empty:
        return {
            "priceData": [],
            "volumeData": [],
            "lastPrice": 0,
            "prevPrice": 0,
            "priceChange": 0,
            "priceChangePercent": 0
        }

    # 日付を文字列形式に変換
    df['date'] = df.index.strftime('%Y-%m-%d')

    # 価格データとボリュームデータの列リスト
    price_cols = ['date', 'open', 'high', 'low', 'close', 'bodyStart', 'bodyEnd', 'color',
                 'sma5', 'sma25', 'sma75', 'upperBand', 'lowerBand', 'upperBand3', 'lowerBand3']
    volume_cols = ['date', 'volume', 'is_up']

    # 必要なデータを抽出
    price_data = df[price_cols].to_dict('records')
    volume_data = df[volume_cols].rename(columns={'is_up': 'isUp'}).to_dict('records')

    # レスポンス値を計算
    last_price = float(df['close'].iloc[-1])
    prev_price = float(df['close'].iloc[-2]) if len(df) > 1 else last_price
    price_change = last_price - prev_price
    price_change_percent = (price_change / prev_price) * 100 if prev_price else 0

    return {
        "priceData": price_data,
        "volumeData": volume_data,
        "lastPrice": last_price,
        "prevPrice": prev_price,
        "priceChange": price_change,
        "priceChangePercent": price_change_percent
    }


# 為替レートデータを取得する関数
@cache_response
def fetch_forex_data(symbol: str, time_range: str):
    try:
        # Alpha Vantageを使用して為替データを取得
        forex_info = FOREX_SYMBOLS.get(symbol, {})
        if not forex_info:
            raise ValueError(f"未対応の為替シンボル: {symbol}")

        from_currency = forex_info["base"]
        to_currency = forex_info["quote"]

        # 時間範囲を日付に変換
        end_date = datetime.now()
        start_date, output_size = get_date_range(time_range, end_date)

        # Alpha Vantage FX APIを使用
        url = f"https://www.alphavantage.co/query?function=FX_DAILY&from_symbol={from_currency}&to_symbol={to_currency}&outputsize={output_size}&apikey={ALPHA_VANTAGE_API_KEY}"

        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Alpha Vantage API error: {response.text}")

        data = response.json()

        # エラーチェック
        if "Error Message" in data:
            raise HTTPException(status_code=404, detail=f"Alpha Vantage error: {data['Error Message']}")

        if "Time Series FX (Daily)" not in data:
            raise HTTPException(status_code=404, detail=f"No data found for forex {symbol}")

        # データ変換
        time_series = data["Time Series FX (Daily)"]

        # pandasデータフレームに変換 - 一度の操作で完了
        df = pd.DataFrame.from_dict(time_series, orient='index')

        # カラム名を変更
        df.columns = ['open', 'high', 'low', 'close']

        # 日付インデックスを維持しつつ、データ型を変換
        df.index = pd.to_datetime(df.index)

        # 共通データフレーム処理
        df = process_stock_dataframe(df, start_date)
        if df is None:
            raise ValueError("データフレーム処理中にエラーが発生しました")

        # テクニカル指標を計算
        df = calculate_indicators_optimized(df)

        # レスポンスを作成
        return prepare_stock_response(df)

    except Exception as e:
        print(f"為替データ取得エラー: {str(e)}")
        raise

# 時間範囲をパースする共通関数
def get_date_range(time_range, end_date=None):
    if end_date is None:
        end_date = datetime.now()

    if time_range == "1mo":
        start_date = end_date - timedelta(days=30)
        output_size = "compact"
    elif time_range == "3mo":
        start_date = end_date - timedelta(days=90)
        output_size = "compact"
    elif time_range == "6mo":
        start_date = end_date - timedelta(days=180)
        output_size = "full"
    elif time_range == "1y":
        start_date = end_date - timedelta(days=365)
        output_size = "full"
    elif time_range == "5y":
        start_date = end_date - timedelta(days=365 * 5)
        output_size = "full"
    else:
        start_date = end_date - timedelta(days=90)  # デフォルト
        output_size = "compact"

    return start_date, output_size


# 日本株/指数のデータを取得する関数
@cache_response
def fetch_japan_stock_data(symbol: str, time_range: str):
    try:
        stooq_symbol = convert_to_stooq_symbol(symbol)

        # 日付範囲の計算
        end_date = datetime.now()
        start_date, _ = get_date_range(time_range, end_date)

        start_str = start_date.strftime("%Y%m%d")
        end_str = end_date.strftime("%Y%m%d")

        url = f"https://stooq.com/q/d/l/?s={stooq_symbol}&d1={start_str}&d2={end_str}&i=d"

        response = requests.get(url, timeout=10)

        # CSVデータが取得できたか確認
        if response.status_code == 200 and len(response.text) > 100:
            # CSVを直接pandasで読み込み
            csv_data = StringIO(response.text)
            df = pd.read_csv(csv_data)

            if not df.empty:
                # カラム名を標準化
                df.columns = [col.lower() for col in df.columns]

                # 日付カラムをインデックスに設定
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'])
                    df = df.set_index('date')

                # 共通データフレーム処理
                df = process_stock_dataframe(df, start_date)
                if df is not None:
                    # テクニカル指標を計算
                    df = calculate_indicators_optimized(df)

                    # レスポンスを作成
                    return prepare_stock_response(df)

        # Stooqからデータ取得できなかった場合
        print(f"Stooqからデータ取得できませんでした: {response.status_code}")
        # Alpha Vantageで代替
        return fetch_alpha_vantage_data(symbol, time_range)

    except Exception as e:
        print(f"日本株データ取得エラー（Stooq）: {str(e)}")
        # Alpha Vantageで代替
        return fetch_alpha_vantage_data(symbol, time_range)

# シンボル変換ヘルパー関数
def convert_to_stooq_symbol(symbol):
    if symbol == "N225":
        return "^NKX"  # 日経平均株価のStooq用シンボル
    elif ".T" in symbol:
        return symbol.replace(".T", ".JP")  # 日本株の場合はJP形式に変換
    return symbol

# Alpha Vantage用のシンボル変換
def convert_to_alpha_vantage_symbol(symbol):
    if symbol == "N225":
        return "^NSEI"  # インド NIFTY 50（代替）
    elif ".T" in symbol:
        return symbol.replace(".T", "")  # 日本の株式の場合、.Tなしでも試す
    return symbol


# Alpha Vantageから株価データを取得する関数
@cache_response
def fetch_alpha_vantage_data(symbol: str, time_range: str):
    alpha_symbol = convert_to_alpha_vantage_symbol(symbol)

    # 時間範囲を日付に変換
    end_date = datetime.now()
    start_date, output_size = get_date_range(time_range, end_date)

    try:
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={alpha_symbol}&outputsize={output_size}&apikey={ALPHA_VANTAGE_API_KEY}"

        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code,
                              detail=f"Alpha Vantage API error: {response.text}")

        data = response.json()

        # エラーチェック
        if "Error Message" in data:
            raise HTTPException(status_code=404,
                              detail=f"Alpha Vantage error: {data['Error Message']}")

        if "Time Series (Daily)" not in data:
            raise HTTPException(status_code=404,
                              detail=f"No data found for symbol {symbol}")

        # データ変換 - 一度の操作でデータフレームに
        df = pd.DataFrame.from_dict(data["Time Series (Daily)"], orient='index')

        # カラム名を変更
        df.columns = [col.split('. ')[1] for col in df.columns]

        # 日付インデックスを維持しつつ、データ型を変換
        df.index = pd.to_datetime(df.index)

        # 必要なカラムのみ取得
        df = df[['open', 'high', 'low', 'close', 'volume']]

        # 共通データフレーム処理
        df = process_stock_dataframe(df, start_date)
        if df is None:
            raise ValueError("データフレーム処理中にエラーが発生しました")

        # テクニカル指標を計算
        df = calculate_indicators_optimized(df)

        # レスポンスを作成
        return prepare_stock_response(df)

    except Exception as e:
        print(f"Alpha Vantageデータ取得エラー: {str(e)}")
        raise