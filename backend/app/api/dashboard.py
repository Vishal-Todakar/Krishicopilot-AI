from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.session import get_db
from app.models.database import User, Farm, CropScan
from app.api.auth import get_current_user
from app.services.daily_intelligence_service import daily_intelligence_service
from app.services.weather_service import weather_service
from app.services.resources_service import resources_service

router = APIRouter(prefix="/dashboard", tags=["Farm Dashboard"])

@router.get("")
def get_dashboard_summary(
    farm_id: int = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Main unified dashboard endpoint delivering:
    1. Farm Summary
    2. Real-time Weather & 36h Forecast
    3. Multi-factor Crop Health Risk Cards
    4. Today's Farm AI Signature Action Plan
    5. Last Disease Scan with Confidence
    6. Crop Health Trend (Recharts data)
    7. Subsidies Ticker & Quick Actions
    """
    # 1. Fetch farm
    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
    else:
        farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()

    farm_dict = {
        "id": farm.id if farm else None,
        "farm_name": farm.farm_name if farm else "",
        "farmer_name": current_user.full_name or "",
        "location": farm.location if farm else "",
        "primary_crop": farm.primary_crop if farm else "",
        "crop_stage": farm.crop_stage if farm else "",
        "soil_type": farm.soil_type if farm else "",
        "area_acres": farm.area_acres if farm else 0.0,
        "irrigation_method": farm.irrigation_method if farm else "",
        "latitude": farm.latitude if farm else None,
        "longitude": farm.longitude if farm else None
    }

    # 2. Fetch last scan
    last_scan_record = (
        db.query(CropScan)
        .filter(CropScan.user_id == current_user.id)
        .order_by(CropScan.created_at.desc())
        .first()
    )

    if last_scan_record:
        last_scan_dict = {
            "id": last_scan_record.id,
            "crop": last_scan_record.crop,
            "disease": last_scan_record.disease,
            "disease_marathi": last_scan_record.disease_marathi,
            "disease_hindi": last_scan_record.disease_hindi,
            "confidence": last_scan_record.confidence,
            "confidence_tier": last_scan_record.confidence_tier,
            "severity": last_scan_record.severity,
            "scanned_at": last_scan_record.created_at.strftime("%d %b, %I:%M %p") if last_scan_record.created_at else "Today",
            "image_url": last_scan_record.image_url,
            "symptoms": last_scan_record.symptoms
        }
    else:
        last_scan_dict = None

    # 3. Generate Today's Farm AI
    daily_intelligence = daily_intelligence_service.generate_daily_plan(
        farm_data=farm_dict,
        last_scan_data=last_scan_dict
    )

    # 4. Crop health 30-day timeline trend for Recharts
    health_trend = [
        {"day": "Day 10", "health_index": 92, "moisture": 45, "disease_risk": 15},
        {"day": "Day 20", "health_index": 88, "moisture": 40, "disease_risk": 25},
        {"day": "Day 30", "health_index": 85, "moisture": 38, "disease_risk": 30},
        {"day": "Day 38", "health_index": 72, "moisture": 52, "disease_risk": 75},
        {"day": "Day 42 (Today)", "health_index": 70, "moisture": 42, "disease_risk": 85}
    ]

    # 5. Mandi prices sample for quick overview
    mandi_samples = resources_service.get_mandi_prices()

    return {
        "farmer": {
            "name": current_user.full_name,
            "preferred_language": current_user.preferred_language,
            "phone": current_user.phone
        },
        "farm": farm_dict,
        "weather": daily_intelligence["weather_summary"],
        "crop_health_risks": daily_intelligence["crop_health_risks"],
        "irrigation_plan": daily_intelligence["irrigation_plan"],
        "last_scan": last_scan_dict,
        "daily_ai_action_plan": daily_intelligence["action_plan"],
        "agro_bulletin": daily_intelligence["agro_bulletin"],
        "subsidies_and_alerts": daily_intelligence["subsidies_and_alerts"],
        "health_trend": health_trend,
        "mandi_spot_rates": mandi_samples
    }
