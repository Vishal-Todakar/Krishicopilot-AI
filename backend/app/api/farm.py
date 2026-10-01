from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.database import Farm, User
from app.schemas.schemas import FarmCreate, FarmUpdate, FarmResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/farms", tags=["Farm Management"])

@router.get("", response_model=List[FarmResponse])
def get_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return farms

@router.post("", response_model=FarmResponse)
def create_farm(farm_data: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_farm = Farm(
        user_id=current_user.id,
        farm_name=farm_data.farm_name,
        location=farm_data.location,
        state=farm_data.state or "Maharashtra",
        district=farm_data.district or "Nashik",
        latitude=farm_data.latitude or 19.9975,
        longitude=farm_data.longitude or 73.7898,
        area_acres=farm_data.area_acres,
        primary_crop=farm_data.primary_crop,
        soil_type=farm_data.soil_type,
        sowing_date=farm_data.sowing_date or "2026-08-15",
        irrigation_method=farm_data.irrigation_method,
        crop_stage=farm_data.crop_stage
    )
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)
    return new_farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm profile not found")
    return farm

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, farm_update: FarmUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm profile not found")

    update_dict = farm_update.dict(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(farm, key, val)

    db.commit()
    db.refresh(farm)
    return farm
