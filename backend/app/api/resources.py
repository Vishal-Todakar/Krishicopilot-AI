from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.schemas.schemas import AgriculturalResourceResponse, MandiPriceResponse
from app.services.resources_service import resources_service

router = APIRouter(prefix="/resources", tags=["Agricultural Resources & Mandi"])

@router.get("", response_model=List[AgriculturalResourceResponse])
def get_resources(
    state: str = Query("Maharashtra"),
    district: str = Query("Nashik"),
    category: str = Query(None)
):
    """
    Returns verified local agricultural resources including KVKs, universities,
    soil testing laboratories, and government helplines.
    """
    return resources_service.get_nearby_resources(state=state, district=district, category=category)

@router.get("/nearby", response_model=List[AgriculturalResourceResponse])
def get_nearby_resources(
    state: str = Query("Maharashtra"),
    district: str = Query("Nashik")
):
    """
    Location-aware helper returning the closest KVK, agricultural helpline, and soil lab.
    """
    return resources_service.get_nearby_resources(state=state, district=district)

@router.get("/mandi", response_model=List[MandiPriceResponse])
def get_mandi_prices(district: str = Query("Nashik")):
    """
    Returns official APMC E-NAM synced daily commodity spot prices and AI marketing window recommendations.
    """
    return resources_service.get_mandi_prices(district=district)
