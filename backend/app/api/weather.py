from fastapi import APIRouter, Query
from app.schemas.schemas import WeatherResponse
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Agro-Weather Intelligence"])

@router.get("", response_model=WeatherResponse)
def get_weather_telemetry(
    lat: float = Query(19.9975, description="Latitude of farm location"),
    lon: float = Query(73.7898, description="Longitude of farm location"),
    location_name: str = Query("Nashik, Maharashtra", description="Farm location label")
):
    """
    Get current agro-meteorological observations and 36-hour predictive weather forecast.
    """
    return weather_service.get_weather(lat=lat, lon=lon, location_name=location_name)
