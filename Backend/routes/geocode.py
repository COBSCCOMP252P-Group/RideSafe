# routers/geocode.py

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import httpx

router = APIRouter(
    prefix="/geocode",
    tags=["Geocoding"]
)

# -----------------------------------
# Response Schema
# -----------------------------------
class LocationResult(BaseModel):
    display_name: str
    latitude: float
    longitude: float


# -----------------------------------
# Get Coordinates from Address
# Example:
# /geocode/search?address=Negombo Sri Lanka
# -----------------------------------
@router.get("/search", response_model=List[LocationResult])
async def geocode_address(
    address: str = Query(..., description="Address or place name")
):
    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": address,
        "format": "json",
        "limit": 5
    }

    headers = {
        "User-Agent": "SchoolBusTrackingApp/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params, headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Geocoding service failed")

        data = response.json()

        if not data:
            raise HTTPException(status_code=404, detail="Address not found")

        return [
            LocationResult(
                display_name=item["display_name"],
                latitude=float(item["lat"]),
                longitude=float(item["lon"])
            )
            for item in data
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))