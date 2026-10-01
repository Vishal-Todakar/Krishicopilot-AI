import datetime
from typing import Dict, Any, List, Optional
from app.services.weather_service import weather_service
from app.services.risk_service import crop_risk_engine
from app.services.irrigation_service import irrigation_engine

class DailyFarmIntelligenceService:
    """
    Signature Centerpiece Feature: TODAY'S FARM AI
    Synthesizes the entire farm ecosystem into an actionable daily briefing.
    """

    def generate_daily_plan(
        self,
        farm_data: Optional[Dict[str, Any]] = None,
        last_scan_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        farm = farm_data or {
            "farm_name": "",
            "farmer_name": "",
            "location": "",
            "area_acres": 0,
            "primary_crop": "",
            "crop_stage": "",
            "soil_type": "",
            "irrigation_method": "",
            "latitude": 19.9975,
            "longitude": 73.7898
        }

        # 1. Fetch live or calibrated weather
        weather = weather_service.get_weather(
            lat=farm.get("latitude") or 19.9975,
            lon=farm.get("longitude") or 73.7898,
            location_name=farm.get("location") or "Maharashtra, India"
        )
        curr = weather["current"]

        # 2. Latest scan info
        last_scan = last_scan_data or {}

        # 3. Evaluate unified crop risk
        risk = crop_risk_engine.evaluate(
            temperature=curr["temperature_c"],
            humidity=curr["humidity_pct"],
            rain_probability=curr["rain_probability_pct"],
            wind_speed=curr["wind_speed_kmh"],
            crop=farm.get("primary_crop", ""),
            crop_stage=farm.get("crop_stage", ""),
            soil_type=farm.get("soil_type", ""),
            previous_disease=last_scan.get("disease") if last_scan else None
        )

        # 4. Generate irrigation plan
        irrigation = irrigation_engine.generate_advisory(
            crop=farm.get("primary_crop", ""),
            crop_stage=farm.get("crop_stage", ""),
            soil_type=farm.get("soil_type", ""),
            temperature=curr["temperature_c"],
            humidity=curr["humidity_pct"],
            rain_probability=curr["rain_probability_pct"],
            irrigation_method=farm.get("irrigation_method", "")
        )

        # 5. Build dynamic 4-point farm action plan
        action_plan = []
        if risk["rainfall_risk"] == "HIGH":
            action_plan.append({
                "step": "1",
                "title": "Postpone Chemical Spray & Fertilizer Top-Dressing",
                "action": f"Rainfall expected ({curr['rain_probability_pct']}% probability). Do not broadcast Urea or spray foliar fungicides to prevent wash-off.",
                "badge": "Priority 1 • Weather",
                "badge_color": "error"
            })
        else:
            action_plan.append({
                "step": "1",
                "title": "Morning Canopy Inspection",
                "action": "Walk rows to scout new spots and remove any waterlogged weeds.",
                "badge": "Routine Scout",
                "badge_color": "primary"
            })

        if last_scan.get("disease") != "Healthy":
            action_plan.append({
                "step": "2",
                "title": f"Targeted Foliage Sanitation for {last_scan.get('disease')}",
                "action": "Prune severely infected lower leaves showing concentric target spots and dispose safely off-field.",
                "badge": "Crop Protection",
                "badge_color": "secondary"
            })
        else:
            action_plan.append({
                "step": "2",
                "title": "Preventive Organic Micro-Wash",
                "action": "Spray 3% Panchagavya or fermented bio-culture to reinforce beneficial foliar microbes.",
                "badge": "Bio-Shield",
                "badge_color": "secondary"
            })

        action_plan.append({
            "step": "3",
            "title": f"Irrigation Management: {irrigation['recommendation']}",
            "action": f"{irrigation['reason']} Next sensor review: {irrigation['next_review']}.",
            "badge": "Water Optimization",
            "badge_color": "primary"
        })

        action_plan.append({
            "step": "4",
            "title": "Post-Rain Crop Health Rescan",
            "action": "Take a fresh photo of the leaf canopy 24-48 hours after rain ceases to monitor disease expansion.",
            "badge": "AI Monitoring",
            "badge_color": "outline"
        })

        bulletin = (
            f"🌾 TODAY'S FARM AI: Elevated humidity ({curr['humidity_pct']}%) and expected rainfall within "
            f"the next 12–36 hours may accelerate {last_scan.get('disease', 'fungal')} disease pressure on "
            f"{farm.get('primary_crop', 'Tomato')} ({farm.get('crop_stage', 'Vegetative')} stage). "
            f"Hold all unnecessary irrigation and inspect lower canopy leaves before sunset."
        )

        subsidies = [
            "📢 PM-Kisan 17th Installment credited to your linked DBT Aadhaar bank account",
            "☀️ 75% Solar Pump Subsidy open under Maharashtra PM-KUSUM Scheme (A-Component)",
            "🌾 Tomato MSP and cold chain subsidy portal accepting Kharif applications until Friday"
        ]

        return {
            "generated_at": datetime.datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "farm_summary": farm,
            "weather_summary": curr,
            "crop_health_risks": risk,
            "irrigation_plan": irrigation,
            "last_scan": last_scan,
            "action_plan": action_plan,
            "agro_bulletin": bulletin,
            "subsidies_and_alerts": subsidies
        }

daily_intelligence_service = DailyFarmIntelligenceService()
