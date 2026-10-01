from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.models.database import User, Farm, CropScan, KnowledgeDocument, AgriculturalResource, MandiPrice
from app.core.security import hash_password
from app.services.rag_service import AGRICULTURAL_KNOWLEDGE_BASE
from app.services.resources_service import AGRICULTURAL_RESOURCES_DATA, MANDI_SPOT_RATES_DATA

# Import API Routers
from app.api.auth import router as auth_router
from app.api.farm import router as farm_router
from app.api.disease import router as disease_router
from app.api.weather import router as weather_router
from app.api.risk import router as risk_router
from app.api.irrigation import router as irrigation_router
from app.api.assistant import router as assistant_router
from app.api.resources import router as resources_router
from app.api.dashboard import router as dashboard_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KrishiCopilot: AI-Powered Multilingual Farm Decision Support Platform"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_demo_data():
    """Seed initial demo farmer, farm profile, crop scan, and agricultural knowledge documents."""
    db = SessionLocal()
    try:
        # Seed Knowledge Base Documents if empty
        if db.query(KnowledgeDocument).count() == 0:
            for item in AGRICULTURAL_KNOWLEDGE_BASE:
                kd = KnowledgeDocument(
                    title=item["title"],
                    crop=item["crop"],
                    category=item["category"],
                    content=item["content_en"],
                    source_name=item["organization"],
                    source_url=item["source_url"],
                    keywords=item["keywords"]
                )
                db.add(kd)
            db.commit()

    except Exception as e:
        print(f"[Seed] Error seeding demo data: {e}")
    finally:
        db.close()

# Initialize tables and seed demo data on module import
Base.metadata.create_all(bind=engine)
seed_demo_data()

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()

# Register API Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(farm_router, prefix=settings.API_V1_STR)
app.include_router(disease_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(risk_router, prefix=settings.API_V1_STR)
app.include_router(irrigation_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(resources_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "KrishiCopilot API",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "demo_mode": settings.DEMO_MODE,
        "disease_model_mode": settings.DISEASE_MODEL_MODE
    }
