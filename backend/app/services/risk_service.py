from typing import Dict, Any, List, Optional

class CropRiskEngine:
    """
    Transparent multi-factor agro-risk evaluation engine combining 8 physical variables:
    Temperature, Humidity, Rain probability, Wind speed, Crop type, Growth Stage, Soil type, Disease history.
    """

    def evaluate(
        self,
        temperature: float,
        humidity: float,
        rain_probability: float,
        wind_speed: float,
        crop: str = "",
        crop_stage: str = "",
        soil_type: str = "",
        previous_disease: Optional[str] = None,
        recent_scan_severity: Optional[str] = None
    ) -> Dict[str, Any]:
        alerts: List[Dict[str, str]] = []
        
        # 1. Disease Risk Evaluation
        # Fungal diseases thrive under high humidity (>70%), moderate temps (20-30°C), and prior infection
        disease_score = 0
        if humidity >= 75:
            disease_score += 40
        elif humidity >= 60:
            disease_score += 20

        if 20 <= temperature <= 32:
            disease_score += 25
        
        if previous_disease and previous_disease != "Healthy":
            disease_score += 35
            alerts.append({
                "type": "disease",
                "severity": "high",
                "message": f"Active history of {previous_disease} in canopy elevates reinfection probability."
            })

        if disease_score >= 65:
            disease_risk = "HIGH"
            alerts.append({
                "type": "disease",
                "severity": "high",
                "message": f"High humidity ({humidity}%) and favorable temperatures ({temperature}°C) accelerate fungal spore growth in {crop}."
            })
        elif disease_score >= 35:
            disease_risk = "MEDIUM"
        else:
            disease_risk = "LOW"

        # 2. Rainfall Risk Evaluation
        if rain_probability >= 70:
            rainfall_risk = "HIGH"
            alerts.append({
                "type": "rainfall",
                "severity": "high",
                "message": f"High probability of precipitation ({rain_probability}%). Avoid Urea/chemical sprays to prevent nutrient runoff."
            })
        elif rain_probability >= 40:
            rainfall_risk = "MEDIUM"
            alerts.append({
                "type": "rainfall",
                "severity": "medium",
                "message": "Moderate rain chance. Complete critical harvest or field work in morning."
            })
        else:
            rainfall_risk = "LOW"

        # 3. Heat Stress Evaluation
        if temperature >= 38:
            heat_stress = "HIGH"
            alerts.append({
                "type": "heat",
                "severity": "high",
                "message": f"Extreme daytime temperature ({temperature}°C) causes stomatal closure and flower drop."
            })
        elif temperature >= 33:
            heat_stress = "MEDIUM"
        else:
            heat_stress = "LOW"

        # 4. Water Stress Evaluation (Soil Type + Stage + Rain)
        if rain_probability >= 60:
            water_stress = "LOW"
        elif "sandy" in soil_type.lower() and temperature >= 30:
            water_stress = "HIGH"
            alerts.append({
                "type": "water",
                "severity": "high",
                "message": "Sandy soil loses moisture rapidly under elevated temperatures. Soil water tension is high."
            })
        elif crop_stage.lower() in ("flowering", "fruiting", "cri stage") and humidity < 50:
            water_stress = "MEDIUM"
            alerts.append({
                "type": "water",
                "severity": "medium",
                "message": f"Critical growth stage ({crop_stage}) requires steady moisture; monitor root zone."
            })
        else:
            water_stress = "MEDIUM" if "black" in soil_type.lower() and humidity > 70 else "LOW"

        # Calculate composite overall vulnerability index (0 to 100)
        risk_map = {"LOW": 15, "MEDIUM": 50, "HIGH": 85}
        overall_score = round(
            0.40 * risk_map[disease_risk] +
            0.30 * risk_map[rainfall_risk] +
            0.15 * risk_map[water_stress] +
            0.15 * risk_map[heat_stress],
            1
        )

        crop_label = crop if crop else "Crops"
        stage_label = f"({crop_stage} stage) " if crop_stage else ""
        soil_label = f"on {soil_type} " if soil_type else ""
        summary = (
            f"{crop_label} {stage_label}{soil_label}: Weather synergy shows {disease_risk} disease vulnerability "
            f"and {rainfall_risk} rainfall risk. Prioritize canopy aeration and postpone chemical top-dressing."
        )

        return {
            "disease_risk": disease_risk,
            "water_stress": water_stress,
            "heat_stress": heat_stress,
            "rainfall_risk": rainfall_risk,
            "overall_score": overall_score,
            "summary": summary,
            "alerts": alerts,
            "factors_considered": {
                "crop": crop,
                "crop_stage": crop_stage,
                "soil_type": soil_type,
                "temperature_c": temperature,
                "humidity_pct": humidity,
                "rain_probability_pct": rain_probability,
                "wind_speed_kmh": wind_speed,
                "previous_disease": previous_disease
            }
        }

crop_risk_engine = CropRiskEngine()
