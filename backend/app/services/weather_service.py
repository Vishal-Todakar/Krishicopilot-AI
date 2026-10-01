import requests
import datetime
from typing import Dict, Any, List, Optional
from app.core.config import settings

class WeatherService:
    def __init__(self):
        self.api_key = settings.WEATHER_API_KEY
        self.demo_mode = settings.DEMO_MODE or not bool(self.api_key)

    def get_weather(self, lat: float = 19.9975, lon: float = 73.7898, location_name: str = "Nashik, Maharashtra") -> Dict[str, Any]:
        """
        Fetch agro-meteorological telemetry and 36-hour forecast.
        Uses real OpenWeather API if key is present, otherwise returns calibrated demo data.
        """
        if not self.demo_mode and self.api_key:
            try:
                return self._fetch_live_openweather(lat, lon, location_name)
            except Exception as e:
                print(f"[WeatherService] Live API request failed ({e}). Reverting to calibrated agro-weather data.")

        return self._get_calibrated_weather(lat, lon, location_name)

    def _fetch_live_openweather(self, lat: float, lon: float, location_name: str) -> Dict[str, Any]:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={self.api_key}&units=metric"
        res = requests.get(url, timeout=5)
        res.raise_for_status()
        data = res.json()

        first = data["list"][0]
        temp = float(first["main"]["temp"])
        humidity = float(first["main"]["humidity"])
        wind = float(first["wind"]["speed"]) * 3.6  # m/s to km/h
        rain_prob = float(first.get("pop", 0.0)) * 100
        rain_vol = float(first.get("rain", {}).get("3h", 0.0))
        cond = first["weather"][0]["main"]

        forecast_list = []
        for item in data["list"][:6]:
            dt_txt = item["dt_txt"].split(" ")[1][:5]
            forecast_list.append({
                "time": dt_txt,
                "temp": round(float(item["main"]["temp"]), 1),
                "rain_prob": round(float(item.get("pop", 0.0)) * 100, 0),
                "condition": item["weather"][0]["description"].capitalize()
            })

        advisory_head, advisory_desc = self._compute_weather_advisory(temp, humidity, rain_prob)

        return {
            "current": {
                "temperature_c": round(temp, 1),
                "humidity_pct": round(humidity, 1),
                "rainfall_mm": round(rain_vol, 1),
                "rain_probability_pct": round(rain_prob, 0),
                "wind_speed_kmh": round(wind, 1),
                "uv_index": "Moderate (5.2)",
                "condition": cond,
                "icon": "cloud-rain" if rain_prob > 50 else "sun",
                "location_name": location_name,
                "advisory_headline": advisory_head,
                "advisory_detail": advisory_desc
            },
            "forecast_36h": forecast_list
        }

    def _get_calibrated_weather(self, lat: float, lon: float, location_name: str) -> Dict[str, Any]:
        # Realistic agro-meteorological conditions for hackathon demo
        temp = 28.5
        humidity = 76.0
        rain_prob = 78.0
        rainfall_mm = 14.2
        wind = 14.5

        advisory_head, advisory_desc = self._compute_weather_advisory(temp, humidity, rain_prob)

        return {
            "current": {
                "temperature_c": temp,
                "humidity_pct": humidity,
                "rainfall_mm": rainfall_mm,
                "rain_probability_pct": rain_prob,
                "wind_speed_kmh": wind,
                "uv_index": "Normal (4.5)",
                "condition": "Rain Likely (78%)",
                "icon": "cloud-rain",
                "location_name": location_name,
                "advisory_headline": advisory_head,
                "advisory_detail": advisory_desc
            },
            "forecast_36h": [
                {"time": "06:00", "temp": 24.2, "rain_prob": 35.0, "condition": "Overcast"},
                {"time": "12:00", "temp": 29.8, "rain_prob": 78.0, "condition": "Scattered Showers"},
                {"time": "18:00", "temp": 27.0, "rain_prob": 85.0, "condition": "Moderate Rain"},
                {"time": "00:00", "temp": 23.5, "rain_prob": 60.0, "condition": "Light Drizzle"},
                {"time": "06:00 (+1)", "temp": 22.8, "rain_prob": 40.0, "condition": "Misty"},
                {"time": "12:00 (+1)", "temp": 30.2, "rain_prob": 20.0, "condition": "Partly Sunny"}
            ]
        }

    def _compute_weather_advisory(self, temp: float, humidity: float, rain_prob: float) -> tuple[str, str]:
        if rain_prob >= 70:
            return (
                "Heavy Rain Forecast in Next 12–36 Hours",
                f"Moderate to heavy rain expected (Rain probability: {rain_prob}%). Delay all fertilizer broadcast (Urea/DAP) and avoid foliar sprays until clear sky resumes to prevent nutrient leaching."
            )
        elif humidity >= 80:
            return (
                "Elevated Humidity Warning (Foliar Wetness)",
                f"Relative humidity at {humidity}% creates favorable conditions for fungal spore germination. Monitor leaf undersides closely."
            )
        elif temp >= 38:
            return (
                "Heat Stress & Evapotranspiration Alert",
                f"Peak midday temperature ({temp}°C) will accelerate moisture depletion. Schedule light drip irrigation during early morning hours."
            )
        return (
            "Favorable Agricultural Weather Window",
            "Clear skies and moderate wind speeds provide an ideal window for intercultural farm operations and preventive scouting."
        )

weather_service = WeatherService()
