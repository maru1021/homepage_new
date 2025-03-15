from pydantic import BaseModel
from typing import Optional

class LocationInfo(BaseModel):
    ip: str
    country: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    isp: Optional[str] = None