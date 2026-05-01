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
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    hashed_pwd = auth_service.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

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

    if not user or not auth_service.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.MeResponse)
def get_me(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Single endpoint returning full user + profile data (no double-fetch needed)."""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()

    return schemas.MeResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        xp=current_user.xp,
        level=current_user.level,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
        full_name=profile.full_name if profile else None,
        age=profile.age if profile else None,
        weight_kg=profile.weight_kg if profile else None,
        height_cm=profile.height_cm if profile else None,
        gender=profile.gender if profile else None,
        fitness_goal=profile.fitness_goal if profile else None,
    )

@router.put("/me/profile", response_model=schemas.MeResponse)
def update_my_profile(
    profile_data: schemas.ProfileBase,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Update personal and physical stats for the current user."""
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not db_profile:
        # Create profile if it doesn't exist
        db_profile = models.UserProfile(user_id=current_user.id)
        db.add(db_profile)

    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)

    return schemas.MeResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        xp=current_user.xp,
        level=current_user.level,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
        full_name=db_profile.full_name,
        age=db_profile.age,
        weight_kg=db_profile.weight_kg,
        height_cm=db_profile.height_cm,
        gender=db_profile.gender,
        fitness_goal=db_profile.fitness_goal,
    )

@router.get("/me/profile", response_model=schemas.ProfileResponse)
def get_user_profile(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Fetch profile stats for the current authenticated user."""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/leaderboard", response_model=schemas.LeaderboardResponse)
def get_leaderboard(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Get the global XP leaderboard and the current user's rank."""
    # Note: Using python sort for simplicity; for large DBs, use an explicit indexed SQL order_by and rank() window function.
    users = db.query(models.User).order_by(models.User.xp.desc()).all()
    
    leaderboard = []
    current_user_rank = -1
    for idx, user in enumerate(users):
        rank = idx + 1
        is_current = (user.id == current_user.id)
        if is_current:
            current_user_rank = rank
            
        leaderboard.append({
            "id": user.id,
            "username": user.username,
            "xp": user.xp,
            "level": user.level,
            "rank": rank,
            "is_current_user": is_current
        })
        
    return schemas.LeaderboardResponse(
        leaderboard=leaderboard,
        current_user_rank=current_user_rank,
        current_user_xp=current_user.xp
    )
