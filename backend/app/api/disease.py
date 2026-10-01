from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.database.session import get_db
from app.models.database import CropScan, User, Farm
from app.schemas.schemas import DiseasePredictionResponse
from app.services.disease_service import disease_service
from app.api.auth import get_current_user

router = APIRouter(prefix="/disease", tags=["Crop Disease Detection"])

@router.post("/predict", response_model=DiseasePredictionResponse)
async def predict_disease(
    file: Optional[UploadFile] = File(None),
    crop_hint: Optional[str] = Form("Tomato"),
    farm_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze crop photograph using ML model or calibrated agro-vision fallback.
    Returns disease, confidence tier, severity, symptoms, organic/chemical action plan,
    Grad-CAM heatmap attention metrics, and multilingual audio advice.
    """
    filename = "leaf_scan.jpg"
    # Default 250-byte buffer for demo / mock test mode
    image_bytes = b"KRISHICOPILOT_DEMO_LEAF_SCAN_IMAGE_DATA_BUFFER_" * 6

    if file:
        filename = file.filename or "upload.jpg"
        # File type validation
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPEG or PNG image.")
        image_bytes = await file.read()
        # Upload size check (max 10MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit. Please upload a compressed photo.")

    # Call Disease Model Service
    try:
        prediction = disease_service.predict(image_bytes, filename=filename, crop_hint=crop_hint)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model inference failed: {str(e)}")

    # Save prediction to user's crop scan history
    scan_record = CropScan(
        farm_id=farm_id,
        user_id=current_user.id,
        crop=prediction["crop"],
        disease=prediction["disease"],
        disease_scientific=prediction.get("disease_scientific"),
        disease_marathi=prediction.get("disease_marathi"),
        disease_hindi=prediction.get("disease_hindi"),
        confidence=prediction["confidence"],
        confidence_tier=prediction["confidence_tier"],
        severity=prediction["severity"],
        symptoms=prediction["symptoms"],
        general_guidance=prediction["general_guidance"],
        action_plan=prediction["action_plan"],
        organic_options=prediction["organic_options"],
        chemical_options=prediction["chemical_options"],
        disclaimer=prediction["disclaimer"],
        heatmap_url=prediction.get("heatmap_data", {}).get("gradcam_layer"),
        bounding_box=prediction.get("bounding_box")
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    return prediction

@router.get("/history")
def get_scan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Retrieve historical scans for timeline visualization and trend tracking."""
    scans = (
        db.query(CropScan)
        .filter(CropScan.user_id == current_user.id)
        .order_by(CropScan.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": s.id,
            "crop": s.crop,
            "disease": s.disease,
            "disease_marathi": s.disease_marathi,
            "disease_hindi": s.disease_hindi,
            "confidence": s.confidence,
            "confidence_tier": s.confidence_tier,
            "severity": s.severity,
            "symptoms": s.symptoms,
            "action_plan": s.action_plan,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "Recent"
        }
        for s in scans
    ]
