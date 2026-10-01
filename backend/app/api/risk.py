from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import CropRiskResponse
from app.services.risk_service import crop_risk_engine
from app.services.weather_service import weather_service
from app.models.database import Farm

router = APIRouter(prefix="/risk", tags=["Crop Risk Engine"])

@router.get("", response_model=CropRiskResponse)
def evaluate_crop_risk(
    crop: str = Query("Tomato"),
    crop_stage: str = Query("Vegetative"),
    soil_type: str = Query("Black Soil"),
    farm_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """
    Evaluates Disease Risk, Water Stress, Heat Stress, and Rainfall Risk
    by synthesizing current weather, crop stage, soil, and disease history.
    """
    lat, lon, loc = 19.9975, 73.7898, "Nashik, Maharashtra"
    prev_disease = "Early Blight"

    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if farm:
            crop = farm.primary_crop
            crop_stage = farm.crop_stage
            soil_type = farm.soil_type
            lat, lon, loc = farm.latitude, farm.longitude, farm.location

    weather = weather_service.get_weather(lat=lat, lon=lon, location_name=loc)
    curr = weather["current"]

    return crop_risk_engine.evaluate(
        temperature=curr["temperature_c"],
        humidity=curr["humidity_pct"],
        rain_probability=curr["rain_probability_pct"],
        wind_speed=curr["wind_speed_kmh"],
        crop=crop,
        crop_stage=crop_stage,
        soil_type=soil_type,
        previous_disease=prev_disease
    )
