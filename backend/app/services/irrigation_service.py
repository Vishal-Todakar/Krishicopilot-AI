from typing import Dict, Any

class IrrigationAdvisoryEngine:
    """
    Intelligent Irrigation Advisory Engine combining soil type, crop phenological stage,
    ambient evapotranspiration (temp/humidity), and rainfall probability.
    """

    def generate_advisory(
        self,
        crop: str = "",
        crop_stage: str = "",
        soil_type: str = "",
        temperature: float = 28.5,
        humidity: float = 76.0,
        rain_probability: float = 78.0,
        irrigation_method: str = ""
    ) -> Dict[str, Any]:
        soil_label = f"in {soil_type}" if soil_type else "in field soil"
        method_label = irrigation_method if irrigation_method else "irrigation"

        # Rain forecast override
        if rain_probability >= 70:
            recommendation = "AVOID / DELAY"
            status_level = "WARNING"
            reason = (
                f"Rain probability is high ({rain_probability}%). Avoid irrigation to prevent root hypoxia, "
                f"waterlogging {soil_label}, and excessive nutrient leaching."
            )
            expected_water_mm = 0.0
            scheduled_window = "Postpone for 36 hours until rainfall ceases"
            soil_moisture_pct = 42.0
            next_review = "Tomorrow at 06:00 AM"

        elif rain_probability >= 45:
            recommendation = "LIGHT IRRIGATION"
            status_level = "SAFE"
            reason = (
                f"Scattered precipitation forecasted ({rain_probability}%). Apply 50% regular water volume "
                f"using {method_label} to preserve root zone moisture without saturation."
            )
            expected_water_mm = 12.0
            scheduled_window = "Early morning (06:00 AM - 07:30 AM)"
            soil_moisture_pct = 36.0
            next_review = "In 24 hours"

        elif "sandy" in soil_type.lower() and temperature > 32:
            recommendation = "IMMEDIATE ATTENTION"
            status_level = "CRITICAL"
            reason = (
                f"Sandy soil has low water holding capacity and high ambient temperature ({temperature}°C) "
                f"drives rapid evapotranspiration in {crop} ({crop_stage} stage)."
            )
            expected_water_mm = 30.0
            scheduled_window = "Immediate light pulse irrigation via drip"
            soil_moisture_pct = 22.0
            next_review = "In 12 hours"

        elif crop_stage.lower() in ("flowering", "fruiting", "cri stage"):
            recommendation = "NORMAL IRRIGATION"
            status_level = "SAFE"
            reason = (
                f"{crop} is in critical yield-determining stage ({crop_stage}). Maintain uniform moisture to prevent "
                f"flower abortion and physiological blossom end rot."
            )
            expected_water_mm = 25.0
            scheduled_window = "Early morning (06:00 AM)"
            soil_moisture_pct = 38.0
            next_review = "In 48 hours"

        else:
            recommendation = "NORMAL IRRIGATION"
            status_level = "SAFE"
            reason = f"Normal agronomic water requirement for {crop} in {crop_stage} stage on {soil_type}."
            expected_water_mm = 20.0
            scheduled_window = "Tomorrow morning 06:00 AM"
            soil_moisture_pct = 40.0
            next_review = "In 48 hours"

        crop_notes = (
            f"Advisory for {crop} ({crop_stage}): Using {irrigation_method} delivers water directly to root "
            f"zone, keeping canopy dry and suppressing foliar fungal blights."
        )

        return {
            "recommendation": recommendation,
            "status_level": status_level,
            "reason": reason,
            "soil_moisture_pct": soil_moisture_pct,
            "expected_water_mm": expected_water_mm,
            "scheduled_window": scheduled_window,
            "next_review": next_review,
            "crop_specific_notes": crop_notes
        }

irrigation_engine = IrrigationAdvisoryEngine()
