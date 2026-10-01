import os

class Settings:
    PROJECT_NAME: str = "KrishiCopilot"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment variables
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./krishicopilot.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "krishi_secret_super_key_2026_agtech_prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    DISEASE_MODEL_MODE: str = os.getenv("DISEASE_MODEL_MODE", "mock")  # "mock" or "real"
    
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    STITCH_API_KEY: str = os.getenv("STITCH_API_KEY", "")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
