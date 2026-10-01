from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.database import User, Farm
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserProfile, UserProfileUpdate
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to retrieve the authenticated user from JWT token."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        hashed_password=hash_password(user_data.password),
        preferred_language=user_data.preferred_language
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial farm profile for user
    default_farm = Farm(
        user_id=new_user.id,
        farm_name=f"{new_user.full_name}'s Farm" if new_user.full_name else "My Farm",
        location="",
        primary_crop="",
        soil_type="",
        area_acres=0.0,
        irrigation_method="",
        crop_stage=""
    )
    db.add(default_farm)
    db.commit()

    token = create_access_token(new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "preferred_language": new_user.preferred_language
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "preferred_language": user.preferred_language
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "preferred_language": current_user.preferred_language,
        "avatar_url": current_user.avatar_url,
        "village": current_user.village,
        "district": current_user.district,
        "state": current_user.state,
        "bio": current_user.bio,
        "farms": [
            {
                "id": f.id,
                "farm_name": f.farm_name,
                "location": f.location,
                "primary_crop": f.primary_crop,
                "crop_stage": f.crop_stage,
                "soil_type": f.soil_type,
                "area_acres": f.area_acres,
                "irrigation_method": f.irrigation_method
            }
            for f in farms
        ]
    }

@router.put("/profile")
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update farmer personal details, avatar profile picture, and preferences."""
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.preferred_language is not None:
        current_user.preferred_language = profile_data.preferred_language
    if profile_data.avatar_url is not None:
        current_user.avatar_url = profile_data.avatar_url
    if profile_data.village is not None:
        current_user.village = profile_data.village
    if profile_data.district is not None:
        current_user.district = profile_data.district
    if profile_data.state is not None:
        current_user.state = profile_data.state
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio

    db.commit()
    db.refresh(current_user)

    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "preferred_language": current_user.preferred_language,
        "avatar_url": current_user.avatar_url,
        "village": current_user.village,
        "district": current_user.district,
        "state": current_user.state,
        "bio": current_user.bio,
        "farms": [
            {
                "id": f.id,
                "farm_name": f.farm_name,
                "location": f.location,
                "primary_crop": f.primary_crop,
                "crop_stage": f.crop_stage,
                "soil_type": f.soil_type,
                "area_acres": f.area_acres,
                "irrigation_method": f.irrigation_method
            }
            for f in farms
        ]
    }
