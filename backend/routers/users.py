from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user account and initialize their profile."""
    # Check if user already exists
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Hash password and create user
    hashed_pwd = auth_service.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize profile with provided data
    new_profile = models.UserProfile(
        user_id=new_user.id,
        full_name=user.full_name,
        age=user.age,
        weight_kg=user.weight_kg,
        height_cm=user.height_cm,
        gender=user.gender,
        fitness_goal=user.fitness_goal
    )
    db.add(new_profile)
    db.commit()
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not auth_service.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create token
    access_token = auth_service.create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me/profile", response_model=schemas.ProfileResponse)
def get_user_profile(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Fetch profile stats for the current authenticated user."""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/me/profile", response_model=schemas.ProfileResponse)
def update_user_profile(profile_data: schemas.ProfileBase, current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Update personal and physical stats for the current user."""
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update fields
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
