from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, timedelta

from ..database.database import get_db
from ..database import models
from ..schemas import schemas
from ..services import auth_service

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

def admin_required(current_user: models.User = Depends(auth_service.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), _ = Depends(admin_required)):
    """Fetch high-level platform metrics for the admin dashboard."""
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    
    # Platform-wide session stats
    total_sessions = db.query(models.WorkoutSession).count()
    
    # Sessions in last 24h
    today = date.today()
    sessions_today = db.query(models.WorkoutSession).filter(models.WorkoutSession.date == today).count()
    
    # Platform-wide total volume (sum of reps)
    total_reps = db.query(func.sum(models.WorkoutSession.reps_actual)).scalar() or 0
    
    # Average form score across all users
    avg_form = db.query(func.avg(models.WorkoutSession.form_score)).scalar() or 0.0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_sessions": total_sessions,
        "sessions_today": sessions_today,
        "total_reps": int(total_reps),
        "avg_form_score": round(float(avg_form), 2)
    }

@router.get("/users", response_model=List[schemas.MeResponse])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    _ = Depends(admin_required)
):
    """List all platform users with profile data."""
    query = db.query(models.User)
    
    if search:
        query = query.filter(
            (models.User.username.ilike(f"%{search}%")) | 
            (models.User.email.ilike(f"%{search}%"))
        )
    
    users = query.offset(skip).limit(limit).all()
    
    # We return MeResponse which includes profile fields
    # We need to manually construct it since MeResponse expects combined data
    results = []
    for u in users:
        profile = u.profile
        results.append(schemas.MeResponse(
            id=u.id,
            username=u.username,
            email=u.email,
            xp=u.xp,
            level=u.level,
            created_at=u.created_at,
            is_active=u.is_active,
            is_admin=u.is_admin,
            full_name=profile.full_name if profile else None,
            age=profile.age if profile else None,
            weight_kg=profile.weight_kg if profile else None,
            height_cm=profile.height_cm if profile else None,
            gender=profile.gender if profile else None,
            fitness_goal=profile.fitness_goal if profile else None,
        ))
    return results

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int, 
    is_active: bool, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(admin_required)
):
    """Enable or disable a user account."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
        
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.is_active = is_active
    db.commit()
    return {"message": f"User status updated to {'active' if is_active else 'inactive'}"}

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int, 
    db: Session = Depends(get_db), 
    _ = Depends(admin_required)
):
    """Remove a workout session from the platform."""
    db_session = db.query(models.WorkoutSession).filter(models.WorkoutSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(db_session)
    db.commit()
    return {"message": "Session deleted successfully"}
