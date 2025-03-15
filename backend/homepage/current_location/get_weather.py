from backend.city_mapping import CITY_MAPPING
from fastapi import HTTPException
import httpx
from typing import Optional
from backend.homepage.current_location.router import WeatherInfo

async def get_weather_info(city: str, country: Optional[str] = None):
    try:
        # 都市名から緯度経度を取得するためのGeocoding API
        geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search"
        params = {
            "name": city,
            "count": 1,
            "language": "ja",
            "format": "json"
        }

        async with httpx.AsyncClient() as client:
            # 位置情報の取得
            geo_response = await client.get(geocoding_url, params=params)

            if geo_response.status_code != 200:
                print(f"位置情報の取得に失敗: {geo_response.status_code}")
                raise HTTPException(status_code=500, detail="位置情報の取得に失敗しました")

            geo_data = geo_response.json()

            if not geo_data.get("results"):
                print(f"都市 '{city}' の位置情報が見つかりません")
                raise HTTPException(status_code=404, detail=f"都市 '{city}' の位置情報が見つかりません")

            # 最初の結果を使用
            location = geo_data["results"][0]
            latitude = location["latitude"]
            longitude = location["longitude"]

            # 取得した緯度経度で天気情報を取得
            weather_url = "https://api.open-meteo.com/v1/forecast"
            weather_params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": ["temperature_2m", "relative_humidity_2m", "weather_code", "wind_speed_10m"],
                "timezone": "auto"
            }

            weather_response = await client.get(weather_url, params=weather_params)

            if weather_response.status_code != 200:
                print(f"天気情報の取得に失敗: {weather_response.status_code}")
                raise HTTPException(status_code=500, detail="天気情報の取得に失敗しました")

            weather_data = weather_response.json()

            # OpenMeteoの天気コードをOpenWeatherMapのアイコンコードに変換
            weather_code = weather_data["current"]["weather_code"]
            icon = convert_weather_code_to_icon(weather_code)

            # 天気コードを日本語の天気状態に変換
            condition = convert_weather_code_to_condition(weather_code)

            result = WeatherInfo(
                temperature=round(weather_data["current"]["temperature_2m"], 1),
                condition=condition,
                humidity=int(weather_data["current"]["relative_humidity_2m"]),
                windSpeed=round(weather_data["current"]["wind_speed_10m"], 1),
                icon=icon
            )

            return result

    except Exception as e:
        print(f"天気情報取得中にエラーが発生しました: {str(e)}")
        # エラー時はダミーデータを返す
        return WeatherInfo(
            temperature='-',
            condition="情報取得不可",
            humidity='-',
            windSpeed='-',
            icon="50d"  # 霧のアイコンコード
        )


# OpenMeteoの天気コードをOpenWeatherMapのアイコンコードに変換
def convert_weather_code_to_icon(code):
    # WMO Weather interpretation codes: https://open-meteo.com/en/docs
    code_map = {
        # 晴れ
        0: "01d",
        1: "02d",
        # 曇り
        2: "02d",
        3: "03d",
        # 霧
        45: "50d",
        48: "50d",
        # 霧雨
        51: "09d",
        53: "09d",
        55: "09d",
        # 雨
        61: "10d",
        63: "10d",
        65: "10d",
        # 雪
        71: "13d",
        73: "13d",
        75: "13d",
        # にわか雨/雪
        80: "09d",
        81: "09d",
        82: "09d",
        85: "13d",
        86: "13d",
        # 雷雨
        95: "11d",
        96: "11d",
        99: "11d",
    }
    return code_map.get(code, "50d")  # デフォルトは霧


# 天気コードを日本語の天気状態に変換
def convert_weather_code_to_condition(code):
    code_map = {
        0: "快晴",
        1: "晴れ",
        2: "一部曇り",
        3: "曇り",
        45: "霧",
        48: "霧氷",
        51: "小雨",
        53: "雨",
        55: "強い雨",
        61: "小雨",
        63: "雨",
        65: "大雨",
        71: "小雪",
        73: "雪",
        75: "大雪",
        80: "にわか雨",
        81: "にわか雨",
        82: "強いにわか雨",
        85: "にわか雪",
        86: "強いにわか雪",
        95: "雷雨",
        96: "雷と小さな雹",
        99: "雷と大きな雹"
    }
    return code_map.get(code, "不明")