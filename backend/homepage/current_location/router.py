from fastapi import APIRouter, Request, HTTPException
import httpx
from backend.homepage.current_location.schemas import LocationInfo, BrowserLocation, BrowserLocationResponse, WeatherInfo
from typing import Optional
from backend.utils.logger import logger

router = APIRouter()

@router.get("/location", response_model=LocationInfo)
async def get_location_info(request: Request):
    try:
        # ヘッダーからクライアントの実際のIPを取得
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                client_ip = real_ip
            else:
                client_ip = request.client.host

        # プライベートIPの判定
        if (client_ip == "127.0.0.1" or
            client_ip == "::1" or
            client_ip.startswith("172.") or
            client_ip.startswith("192.168.") or
            client_ip.startswith("10.")):
            # 開発環境用のダミーデータ
            return LocationInfo(
                ip="開発環境",
                country="開発国",
                region="開発地域",
                city="開発都市",
                timezone="Asia/Tokyo",
                isp="開発ISP"
            )

        # ipinfo.ioを使用して位置情報を取得
        async with httpx.AsyncClient() as client:
            # 無料アカウントでも使用可能
            response = await client.get(f"https://ipinfo.io/{client_ip}/json")

            if response.status_code != 200:
                logger.write_error_log(
                    f"Error in get_location_info: {str(e)}\n"
                    f"Function: get_location_info\n"
                    f"Client IP: {client_ip}"
                )

                # 代替としてipapi.coを試す
                alt_response = await client.get(f"https://ipapi.co/{client_ip}/json/")
                if alt_response.status_code != 200:
                    raise HTTPException(status_code=500, detail="位置情報の取得に失敗しました")

                data = alt_response.json()
                return LocationInfo(
                    ip=data.get("ip", client_ip),
                    country=data.get("country_name"),
                    region=data.get("region"),
                    city=data.get("city"),
                    timezone=data.get("timezone"),
                    isp=data.get("org")
                )

            data = response.json()

            # ipinfo.ioからのレスポンスをLocationInfoに変換
            # 注: ipinfo.ioのレスポンス形式はipapi.coと異なる
            return LocationInfo(
                ip=data.get("ip", client_ip),
                country=data.get("country"),  # 国コード
                region=data.get("region"),    # 地域/州
                city=data.get("city"),        # 都市
                timezone=data.get("timezone"),
                isp=data.get("org")           # 組織/ISP
            )

    except Exception as e:
        logger.write_error_log(
            f"Error in get_location_info: {str(e)}\n"
            f"Function: get_location_info\n"
            f"Client IP: {client_ip}"
        )
        raise HTTPException(status_code=500, detail=f"位置情報の取得に失敗しました: {str(e)}")


@router.post("/browser-location", response_model=BrowserLocationResponse)
async def process_browser_location(location: BrowserLocation):
    """
    ブラウザから送信された緯度・経度を使って詳細な住所情報を取得
    """
    try:
        # OpenStreetMapのNominatim APIを使用して逆ジオコーディング
        # 注: 実運用では使用制限があるため、他のサービスを検討することも
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": location.latitude,
                    "lon": location.longitude,
                    "format": "json",
                    "addressdetails": 1,
                    "accept-language": "ja"  # 日本語の結果を優先
                },
                headers={
                    "User-Agent": "YourApp/1.0"  # OpenStreetMapは適切なUser-Agentを要求
                }
            )

            if response.status_code != 200:
                logger.write_error_log(
                    f"Error in process_browser_location: {str(e)}\n"
                    f"Function: process_browser_location\n"
                    f"Location: {location}"
                )
                # 座標情報だけ返す
                return BrowserLocationResponse(
                    latitude=location.latitude,
                    longitude=location.longitude
                )

            data = response.json()

            # 応答データから必要な情報を抽出
            address = data.get("display_name", "")
            address_details = data.get("address", {})

            # 都市情報を取得 (都市部と郊外で異なるフィールドになる場合がある)
            city = (
                address_details.get("city") or
                address_details.get("town") or
                address_details.get("village") or
                address_details.get("hamlet") or
                ""
            )

            # 地域情報を取得
            region = (
                address_details.get("state") or
                address_details.get("county") or
                address_details.get("prefecture") or  # 日本の場合
                ""
            )

            # 国情報を取得
            country = address_details.get("country", "")

            return BrowserLocationResponse(
                latitude=location.latitude,
                longitude=location.longitude,
                address=address,
                city=city,
                region=region,
                country=country
            )

    except Exception as e:
        logger.write_error_log(
            f"Error in process_browser_location: {str(e)}\n"
            f"Function: process_browser_location\n"
            f"Location: {location}"
        )
        # エラーが発生しても座標情報だけは返す
        return BrowserLocationResponse(
            latitude=location.latitude,
            longitude=location.longitude
        )

# プロバイダの情報取得
@router.get("/location", response_model=LocationInfo)
async def get_location_info(request: Request):
    try:
        # ヘッダーからクライアントの実際のIPを取得
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                client_ip = real_ip
            else:
                client_ip = request.client.host

        logger.write_error_log(
            f"Error in get_location_info: {str(e)}\n"
            f"Function: get_location_info\n"
            f"Client IP: {client_ip}"
        )

        # プライベートIPの判定
        if (client_ip == "127.0.0.1" or
            client_ip == "::1" or
            client_ip.startswith("172.") or
            client_ip.startswith("192.168.") or
            client_ip.startswith("10.")):
            # 開発環境用のダミーデータ
            return LocationInfo(
                ip=client_ip,
                country="-",
                region="-",
                city="-",
                timezone="Asia/Tokyo",
                isp="-"
            )

        # 外部APIでIPの位置情報を取得
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://ipapi.co/{client_ip}/json/")

            if response.status_code != 200:
                logger.write_error_log(
                    f"Error in get_location_info: {str(e)}\n"
                    f"Function: get_location_info\n"
                    f"Client IP: {client_ip}"
                )
                raise HTTPException(status_code=500, detail="位置情報の取得に失敗しました")

            data = response.json()

            return LocationInfo(
                ip=data.get("ip", client_ip),
                country=data.get("country_name"),
                region=data.get("region"),
                city=data.get("city"),
                timezone=data.get("timezone"),
                isp=data.get("org")
            )

    except Exception as e:
        logger.write_error_log(
            f"Error in get_location_info: {str(e)}\n"
            f"Function: get_location_info\n"
            f"Client IP: {client_ip}"
        )
        raise HTTPException(status_code=500, detail=f"位置情報の取得に失敗しました: {str(e)}")


from backend.homepage.current_location.get_weather import get_weather_info
@router.get("/weather", response_model=WeatherInfo)
async def get_weather_endpoint(city: str, country: Optional[str] = None):
    try:
        return await get_weather_info(city, country)

    except Exception as e:
        logger.write_error_log(
            f"Error in get_weather_endpoint: {str(e)}\n"
            f"Function: get_weather_endpoint\n"
            f"City: {city}\n"
            f"Country: {country}"
        )
        # エラー時はダミーデータを返す
        return WeatherInfo(
            temperature='-',
            condition="情報取得不可",
            humidity='-',
            windSpeed='-',
            icon='-'
        )
