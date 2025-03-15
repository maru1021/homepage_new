from fastapi import APIRouter, Request, HTTPException
import httpx
from backend.homepage.current_location.schemas import LocationInfo


router = APIRouter()


@router.get("/location", response_model=LocationInfo)
async def get_location_info(request: Request):
    try:
        # クライアントのIPアドレスを取得
        client_ip = request.client.host

        if (client_ip == "127.0.0.1" or
            client_ip == "::1" or
            client_ip.startswith("172.") or  # Dockerネットワーク
            client_ip.startswith("192.168.") or  # プライベートネットワーク
            client_ip.startswith("10.")):
            # 開発時はダミーデータ
            return LocationInfo(
                ip="開発環境",
                country="開発国",
                region="開発地域",
                city="開発都市",
                timezone="Asia/Tokyo",
                isp="開発ISP"
            )

        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://ipapi.co/{client_ip}/json/")

            if response.status_code != 200:
                print(f"外部APIからのレスポンスエラー: {response.status_code}")
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
        print(f"位置情報取得中にエラーが発生しました: {str(e)}")
        raise HTTPException(status_code=500, detail=f"位置情報の取得に失敗しました: {str(e)}")
