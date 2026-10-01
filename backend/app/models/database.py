import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    bio = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    preferred_language = Column(String(10), default="en")  # "mr", "hi", "en"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    scans = relationship("CropScan", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    state = Column(String(100), default="Maharashtra")
    district = Column(String(100), default="Nashik")
    latitude = Column(Float, default=19.9975)
    longitude = Column(Float, default=73.7898)
    area_acres = Column(Float, default=2.5)
    primary_crop = Column(String(100), default="Tomato")
    soil_type = Column(String(100), default="Black Soil")
    sowing_date = Column(String(50), default="2026-08-15")
    irrigation_method = Column(String(100), default="Drip Irrigation")
    crop_stage = Column(String(100), default="Vegetative")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    scans = relationship("CropScan", back_populates="farm", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="farm", cascade="all, delete-orphan")
    irrigation_advisories = relationship("IrrigationAdvisory", back_populates="farm", cascade="all, delete-orphan")


class CropScan(Base):
    __tablename__ = "crop_scans"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop = Column(String(100), nullable=False)
    disease = Column(String(150), nullable=False)
    disease_scientific = Column(String(200), nullable=True)
    disease_marathi = Column(String(200), nullable=True)
    disease_hindi = Column(String(200), nullable=True)
    confidence = Column(Float, nullable=False)
    confidence_tier = Column(String(50), nullable=False)  # "HIGH", "MODERATE", "LOW"
    severity = Column(String(50), default="MODERATE")     # "LOW", "MODERATE", "HIGH"
    symptoms = Column(JSON, default=list)
    general_guidance = Column(Text, nullable=True)
    action_plan = Column(JSON, default=list)
    organic_options = Column(JSON, default=list)
    chemical_options = Column(JSON, default=list)
    disclaimer = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    heatmap_url = Column(Text, nullable=True)
    bounding_box = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="scans")
    user = relationship("User", back_populates="scans")


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, nullable=True)
    location_name = Column(String(150), default="Nashik, Maharashtra")
    temperature_c = Column(Float, default=28.5)
    humidity_pct = Column(Float, default=74.0)
    rainfall_mm = Column(Float, default=12.5)
    rain_probability_pct = Column(Float, default=78.0)
    wind_speed_kmh = Column(Float, default=14.2)
    uv_index = Column(String(50), default="Normal")
    condition = Column(String(100), default="Rain Likely")
    icon = Column(String(50), default="rain")
    forecast_36h = Column(JSON, default=list)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    disease_risk = Column(String(20), default="HIGH")   # "LOW", "MEDIUM", "HIGH"
    water_stress = Column(String(20), default="MEDIUM")
    heat_stress = Column(String(20), default="LOW")
    rainfall_risk = Column(String(20), default="HIGH")
    overall_score = Column(Float, default=72.0)
    summary = Column(Text, nullable=True)
    risk_factors = Column(JSON, default=list)
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="risk_assessments")


class IrrigationAdvisory(Base):
    __tablename__ = "irrigation_advisories"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    recommendation = Column(String(50), default="AVOID / DELAY") # "APPLY", "AVOID / DELAY", "LIGHT IRRIGATION"
    status_level = Column(String(20), default="WARNING")         # "SAFE", "WARNING", "CRITICAL"
    reason = Column(Text, nullable=False)
    expected_water_mm = Column(Float, default=0.0)
    soil_moisture_pct = Column(Float, default=42.0)
    scheduled_window = Column(String(100), default="Hold until post-rain assessment")
    next_review = Column(String(100), default="In 24 hours")
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    farm = relationship("Farm", back_populates="irrigation_advisories")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), default="default")
    sender = Column(String(20), default="user") # "user" or "assistant"
    message = Column(Text, nullable=False)
    language = Column(String(10), default="en")  # "mr", "hi", "en"
    sources = Column(JSON, default=list)
    confidence = Column(Float, default=0.95)
    audio_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chats")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    crop = Column(String(100), nullable=True)
    category = Column(String(100), nullable=False) # "disease", "irrigation", "soil", "fertilizer", "scheme"
    content = Column(Text, nullable=False)
    source_name = Column(String(255), nullable=False) # "ICAR Central Potato Research", "MPKV Rahuri", "Govt of Maharashtra"
    source_url = Column(String(500), nullable=True)
    keywords = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AgriculturalResource(Base):
    __tablename__ = "agricultural_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # "KVK", "University", "Government Scheme", "Helpline", "Soil Testing"
    state = Column(String(100), default="Maharashtra")
    district = Column(String(100), default="Nashik")
    phone = Column(String(100), nullable=True)
    email = Column(String(150), nullable=True)
    address = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, index=True)
    market_name = Column(String(150), nullable=False)
    state = Column(String(100), default="Maharashtra")
    district = Column(String(100), default="Nashik")
    commodity = Column(String(100), nullable=False)
    variety = Column(String(100), default="Standard")
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    change_pct = Column(Float, default=0.0)
    trend = Column(String(20), default="up")
    arrival_quintals = Column(Integer, default=500)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
