from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    preferred_language: str = "en"

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    preferred_language: str = "en"
    avatar_url: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    bio: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    avatar_url: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    bio: Optional[str] = None

# --- Farm Schemas ---
class FarmCreate(BaseModel):
    farm_name: str
    location: str
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = "Nashik"
    latitude: Optional[float] = 19.9975
    longitude: Optional[float] = 73.7898
    area_acres: float = 2.5
    primary_crop: str = "Tomato"
    soil_type: str = "Black Soil"
    sowing_date: Optional[str] = "2026-08-15"
    irrigation_method: str = "Drip Irrigation"
    crop_stage: str = "Vegetative"

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    location: Optional[str] = None
    area_acres: Optional[float] = None
    primary_crop: Optional[str] = None
    soil_type: Optional[str] = None
    crop_stage: Optional[str] = None
    irrigation_method: Optional[str] = None

class FarmResponse(BaseModel):
    id: int
    user_id: int
    farm_name: str
    location: str
    state: str
    district: str
    latitude: float
    longitude: float
    area_acres: float
    primary_crop: str
    soil_type: str
    sowing_date: str
    irrigation_method: str
    crop_stage: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Disease Prediction Schemas ---
class DiseasePredictionResponse(BaseModel):
    crop: str
    disease: str
    disease_scientific: Optional[str] = None
    disease_marathi: Optional[str] = None
    disease_hindi: Optional[str] = None
    confidence: float
    confidence_tier: str # "HIGH", "MODERATE", "LOW"
    severity: str        # "LOW", "MODERATE", "HIGH"
    symptoms: List[str]
    general_guidance: str
    action_plan: List[str]
    organic_options: List[Dict[str, str]]
    chemical_options: List[Dict[str, str]]
    disclaimer: str
    heatmap_data: Optional[Dict[str, Any]] = None
    bounding_box: Optional[Dict[str, Any]] = None
    is_low_confidence: bool = False
    warning: Optional[str] = None
    audio_advice_text: Optional[str] = None

# --- Weather Schemas ---
class WeatherTelemetry(BaseModel):
    temperature_c: float
    humidity_pct: float
    rainfall_mm: float
    rain_probability_pct: float
    wind_speed_kmh: float
    uv_index: str
    condition: str
    icon: str
    location_name: str
    advisory_headline: str
    advisory_detail: str

class WeatherForecastItem(BaseModel):
    time: str
    temp: float
    rain_prob: float
    condition: str

class WeatherResponse(BaseModel):
    current: WeatherTelemetry
    forecast_36h: List[WeatherForecastItem]

# --- Crop Risk Schemas ---
class CropRiskResponse(BaseModel):
    disease_risk: str   # "LOW", "MEDIUM", "HIGH"
    water_stress: str   # "LOW", "MEDIUM", "HIGH"
    heat_stress: str    # "LOW", "MEDIUM", "HIGH"
    rainfall_risk: str  # "LOW", "MEDIUM", "HIGH"
    overall_score: float # 0 - 100
    summary: str
    alerts: List[Dict[str, str]]
    factors_considered: Dict[str, Any]

# --- Irrigation Schemas ---
class IrrigationAdvisoryResponse(BaseModel):
    recommendation: str # "AVOID / DELAY", "LIGHT IRRIGATION", "NORMAL IRRIGATION", "IMMEDIATE ATTENTION"
    status_level: str   # "SAFE", "WARNING", "CRITICAL"
    reason: str
    soil_moisture_pct: float
    expected_water_mm: float
    scheduled_window: str
    next_review: str
    crop_specific_notes: str

# --- Daily Farm AI Intelligence Schemas ---
class DailyFarmIntelligenceResponse(BaseModel):
    generated_at: str
    farm_summary: Dict[str, Any]
    weather_summary: Dict[str, Any]
    crop_health_risks: CropRiskResponse
    irrigation_plan: IrrigationAdvisoryResponse
    last_scan: Optional[Dict[str, Any]]
    action_plan: List[Dict[str, str]]
    agro_bulletin: str
    subsidies_and_alerts: List[str]

# --- AI Assistant Schemas ---
class AssistantChatRequest(BaseModel):
    message: str
    farm_id: Optional[int] = None
    language: Optional[str] = "en" # "mr", "hi", "en"
    session_id: Optional[str] = "default"

class SourceCitation(BaseModel):
    title: str
    source_name: str
    category: str
    url: Optional[str] = None

class AssistantChatResponse(BaseModel):
    message: str
    detected_language: str
    sources: List[SourceCitation]
    confidence: float
    audio_text: str
    action_items: Optional[List[str]] = None

# --- Agricultural Resources ---
class AgriculturalResourceResponse(BaseModel):
    id: int
    title: str
    category: str
    state: str
    district: str
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    website: Optional[str]
    description: Optional[str]
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

# --- Mandi Prices ---
class MandiPriceResponse(BaseModel):
    id: int
    market_name: str
    state: str
    district: str
    commodity: str
    variety: str
    min_price: float
    max_price: float
    modal_price: float
    change_pct: float
    trend: str
    arrival_quintals: int
    optimal_window: Optional[str] = None

    class Config:
        from_attributes = True
