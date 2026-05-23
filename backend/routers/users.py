from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database import models
from ..schemas import schemas
from ..services import auth_service
from ..core.metrics import GLOBAL_METRICS
from sqlalchemy.sql import func

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user account and initialize their profile."""
    # Password strength validation using regex
    import re
    password = user.password
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[@$!%*?&#]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (@$!%*?&#)")

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
        GLOBAL_METRICS.increment_failed_login()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Update last login time
    user.last_login = func.now()
    db.commit()

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
        is_admin=current_user.is_admin,
        rag_tokens_total=current_user.rag_tokens_total,
        rag_token_limit=current_user.rag_token_limit,
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
        is_admin=current_user.is_admin,
        rag_tokens_total=current_user.rag_tokens_total,
        rag_token_limit=current_user.rag_token_limit,
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


@router.put("/me/password", status_code=status.HTTP_200_OK)
def change_password(
    payload: schemas.PasswordChangeRequest,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change the current user's password.
    Requires the existing password for verification and enforces complexity rules on the new one.
    """
    import re

    # 1. Verify old password
    if not auth_service.verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect."
        )

    # 2. Enforce new password complexity
    new_pw = payload.new_password
    if len(new_pw) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", new_pw):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", new_pw):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter.")
    if not re.search(r"\d", new_pw):
        raise HTTPException(status_code=400, detail="Password must contain at least one number.")
    if not re.search(r"[@$!%*?&#]", new_pw):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (@$!%*?&#).")

    # 3. Prevent reuse of the same password
    if auth_service.verify_password(new_pw, current_user.password_hash):
        raise HTTPException(status_code=400, detail="New password must be different from the current password.")

    # 4. Hash and save
    current_user.password_hash = auth_service.get_password_hash(new_pw)
    db.commit()

    return {"message": "Password updated successfully."}


@router.get("/leaderboard", response_model=schemas.LeaderboardResponse)
def get_leaderboard(
    timeframe: str = "All-time",
    limit: int = 50,
    offset: int = 0,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the global leaderboard with support for timeframes and pagination.
    Timeframes: Daily, Weekly, All-time
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func, desc

    # 1. Base Query for All-time (using the level/xp formula)
    # Total XP = 500 * level * (level - 1) + xp
    all_time_expr = (500 * models.User.level * (models.User.level - 1) + models.User.xp)
    
    if timeframe == "All-time":
        query = db.query(
            models.User.id,
            models.User.username,
            models.User.level,
            all_time_expr.label("total_xp")
        ).filter(models.User.is_admin == False)\
         .order_by(desc(models.User.level), desc(models.User.xp))
    else:
        # 2. Daily/Weekly queries based on WorkoutSession reps
        days = 1 if timeframe == "Daily" else 7
        since_date = datetime.now() - timedelta(days=days)
        
        # Subquery to sum reps per user in timeframe
        session_subquery = db.query(
            models.WorkoutSession.user_id,
            func.sum(models.WorkoutSession.reps_actual * 10).label("period_xp")
        ).filter(models.WorkoutSession.created_at >= since_date)\
         .group_by(models.WorkoutSession.user_id).subquery()

        query = db.query(
            models.User.id,
            models.User.username,
            models.User.level,
            func.coalesce(session_subquery.c.period_xp, 0).label("total_xp")
        ).filter(models.User.is_admin == False)\
         .outerjoin(session_subquery, models.User.id == session_subquery.c.user_id)\
         .order_by(desc("total_xp"))

    # Execute total count for percentile and pagination (exclude admins)
    total_users = db.query(models.User).filter(models.User.is_admin == False).count()
    
    # Execute full leaderboard for rank calculation (if small) 
    # For a real large-scale app, we'd use a window function rank() in SQL.
    # Here we fetch all to calculate ranks accurately across pagination.
    all_results = query.all()
    
    leaderboard_data = []
    current_user_rank = -1
    current_user_xp = 0
    
    last_val = None
    last_rank = 0
    
    for idx, row in enumerate(all_results):
        # Tie-handling: if Level and XP are same as previous, keep same rank
        current_val = (row.level, row.total_xp)
        if current_val == last_val:
            rank = last_rank
        else:
            rank = idx + 1
        
        last_val = current_val
        last_rank = rank
        
        is_current = (row.id == current_user.id)
        if is_current:
            current_user_rank = rank
            current_user_xp = row.total_xp
            
        leaderboard_data.append({
            "id": row.id,
            "username": row.username,
            "xp": row.total_xp, # Lifetime XP
            "level": row.level,
            "rank": rank,
            "is_current_user": is_current
        })

    # Calculate Percentile (exclude admins)
    percentile = 100
    if not current_user.is_admin and total_users > 0 and current_user_rank > 0:
        percentile = max(1, round(((total_users - current_user_rank + 1) / total_users) * 100))
    elif current_user.is_admin:
        percentile = 0

    # Paginate the results
    paginated_leaderboard = leaderboard_data[offset : offset + limit]

    return {
        "leaderboard": paginated_leaderboard,
        "current_user_rank": current_user_rank,
        "current_user_xp": current_user_xp,
        "percentile": percentile,
        "total_count": total_users
    }
