from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import IrrigationAdvisoryResponse
from app.services.irrigation_service import irrigation_engine
from app.services.weather_service import weather_service
from app.models.database import Farm

router = APIRouter(prefix="/irrigation", tags=["Irrigation Advisory"])

@router.get("/advisory", response_model=IrrigationAdvisoryResponse)
def get_irrigation_advisory(
    crop: str = Query("Tomato"),
    crop_stage: str = Query("Vegetative"),
    soil_type: str = Query("Black Soil"),
    irrigation_method: str = Query("Drip Irrigation"),
    farm_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """
    Computes precise irrigation timing and volume advisory based on rain probability,
    soil moisture capacity, crop phenological stage, and ambient vapor pressure deficit.
    """
    lat, lon, loc = 19.9975, 73.7898, "Nashik, Maharashtra"
    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if farm:
            crop = farm.primary_crop
            crop_stage = farm.crop_stage
            soil_type = farm.soil_type
            irrigation_method = farm.irrigation_method
            lat, lon, loc = farm.latitude, farm.longitude, farm.location

    weather = weather_service.get_weather(lat=lat, lon=lon, location_name=loc)
    curr = weather["current"]

    return irrigation_engine.generate_advisory(
        crop=crop,
        crop_stage=crop_stage,
        soil_type=soil_type,
        temperature=curr["temperature_c"],
        humidity=curr["humidity_pct"],
        rain_probability=curr["rain_probability_pct"],
        irrigation_method=irrigation_method
    )
