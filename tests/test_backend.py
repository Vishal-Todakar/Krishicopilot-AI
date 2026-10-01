import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_login_demo_farmer():
    response = client.post("/api/auth/login", json={
        "email": "farmer@krishicopilot.in",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "farmer@krishicopilot.in"

def test_weather_endpoint():
    response = client.get("/api/weather?lat=19.9975&lon=73.7898&location_name=Nashik")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "temperature_c" in data["current"]
    assert "humidity_pct" in data["current"]
    assert "forecast_36h" in data
    assert len(data["forecast_36h"]) > 0

def test_crop_risk_engine():
    response = client.get("/api/risk?crop=Tomato&crop_stage=Vegetative&soil_type=Black%20Soil")
    assert response.status_code == 200
    data = response.json()
    assert data["disease_risk"] in ("LOW", "MEDIUM", "HIGH")
    assert data["rainfall_risk"] in ("LOW", "MEDIUM", "HIGH")
    assert "summary" in data

def test_irrigation_advisory():
    response = client.get("/api/irrigation/advisory?crop=Tomato&crop_stage=Vegetative&soil_type=Black%20Soil&irrigation_method=Drip%20Irrigation")
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "reason" in data
    assert "soil_moisture_pct" in data

def test_disease_predict_mock():
    # Test without image (mock fallback)
    response = client.post("/api/disease/predict", data={"crop_hint": "Tomato"})
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Tomato"
    assert "Early Blight" in data["disease"]
    assert data["confidence"] >= 0.5
    assert len(data["action_plan"]) > 0

def test_rag_assistant_marathi():
    response = client.post("/api/assistant/chat", json={
        "message": "माझ्या टोमॅटोच्या पानांवर काळे डाग आहेत, काय करावे?",
        "language": "mr"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["detected_language"] == "mr"
    assert len(data["sources"]) > 0
    assert "करपा" in data["message"] or "टोमॅटो" in data["message"]

def test_rag_assistant_hindi():
    response = client.post("/api/assistant/chat", json={
        "message": "गेहूं में पहला पानी कब लगाना चाहिए?",
        "language": "hi"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["detected_language"] == "hi"
    assert len(data["sources"]) > 0

def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "farm" in data
    assert "weather" in data
    assert "crop_health_risks" in data
    assert "daily_ai_action_plan" in data
    assert "last_scan" in data

def test_mandi_prices():
    response = client.get("/api/resources/mandi")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "commodity" in data[0]
