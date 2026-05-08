from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, timedelta
import secrets
import time
import os
try:
    import psutil
except ImportError:
    psutil = None
from sqlalchemy import text

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
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(admin_required)):
    """Fetch high-level platform metrics for the admin dashboard."""
    print(f"[ADMIN] Stats requested by {current_user.username}")
    
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    
    # Platform-wide session stats
    total_sessions = db.query(models.WorkoutSession).count()
    
    # Sessions in last 24h
    today = date.today()
    sessions_today = db.query(models.WorkoutSession).filter(models.WorkoutSession.date == today).count()
    
    # Platform-wide total volume (sum of reps)
    total_reps_raw = db.query(func.sum(models.WorkoutSession.reps_actual)).scalar()
    total_reps = int(total_reps_raw) if total_reps_raw is not None else 0
    
    # Average form score across all users
    avg_form_raw = db.query(func.avg(models.WorkoutSession.form_score)).scalar()
    avg_form = float(avg_form_raw) if avg_form_raw is not None else 0.0
    
    # Total RAG Tokens
    total_rag_raw = db.query(func.sum(models.User.rag_tokens_total)).scalar()
    total_rag_tokens = int(total_rag_raw) if total_rag_raw is not None else 0
    
    # Advanced Analytics
    from ..core.metrics import GLOBAL_METRICS
    twenty_four_hours_ago = datetime.now() - timedelta(days=1)
    dau = db.query(models.User).filter(models.User.last_login >= twenty_four_hours_ago).count()
    
    thirty_days_ago = datetime.now() - timedelta(days=30)
    mau = db.query(models.User).filter(models.User.last_login >= thirty_days_ago).count()
    
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "evofit.db")
        db_size_mb = round(os.path.getsize(db_path) / (1024 * 1024), 2)
    except Exception:
        db_size_mb = 0.0
        
    metrics = GLOBAL_METRICS.get_metrics()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_sessions": total_sessions,
        "sessions_today": sessions_today,
        "total_reps": total_reps,
        "avg_form_score": round(avg_form, 2),
        "total_rag_tokens": total_rag_tokens,
        "dau": dau,
        "mau": mau,
        "db_size_mb": db_size_mb,
        "groq_latency_ms": metrics["groq_latency_ms"],
        "total_500_errors": metrics["total_500_errors"],
        "failed_logins": metrics["failed_logins"]
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
    query = db.query(models.User).options(joinedload(models.User.profile))
    
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
            xp=u.xp or 0,
            level=u.level or 1,
            created_at=u.created_at,
            is_active=u.is_active,
            is_admin=u.is_admin,
            rag_tokens_total=u.rag_tokens_total or 0,
            rag_token_limit=u.rag_token_limit or 50000,
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
    
    # Audit Log
    audit = models.AdminAuditLog(
        admin_id=admin.id,
        action="DEACTIVATE_USER" if not is_active else "ACTIVATE_USER",
        details=f"Status of user '{db_user.username}' (ID: {user_id}) set to {is_active}"
    )
    db.add(audit)
    
    db.commit()
    return {"message": f"User status updated to {'active' if is_active else 'inactive'}"}

@router.put("/users/{user_id}/token-limit")
def update_user_token_limit(
    user_id: int, 
    limit: int, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(admin_required)
):
    """Update user's AI token limit."""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.rag_token_limit = limit
    
    # Audit Log
    audit = models.AdminAuditLog(
        admin_id=admin.id,
        action="UPDATE_TOKEN_LIMIT",
        details=f"Token limit of user '{db_user.username}' (ID: {user_id}) updated to {limit}"
    )
    db.add(audit)
    
    db.commit()
    return {"message": f"Token limit updated to {limit}", "rag_token_limit": limit}

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

@router.get("/system-status")
def get_system_status(db: Session = Depends(get_db), _ = Depends(admin_required)):
    """Check health of various system components."""
    start_time = time.time()
    
    # 1. DB Health
    db_status = "operational"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    # 2. ML Health
    ml_status = "operational"
    try:
        from ..services.ml_service import get_metrics
        get_metrics()
    except Exception as e:
        ml_status = f"error: {str(e)}"

    latency = (time.time() - start_time) * 1000 # ms
    
    # 3. System Metrics (Safe fallback if psutil is missing)
    memory_usage = 0
    cpu_usage = 0
    disk_usage = 0
    uptime_sec = 0
    
    if psutil:
        try:
            process = psutil.Process(os.getpid())
            memory_usage = process.memory_info().rss / (1024 * 1024) # MB
            cpu_usage = process.cpu_percent(interval=0.1)
            uptime_sec = time.time() - process.create_time()
            
            # Disk health
            disk = psutil.disk_usage('/')
            disk_usage = disk.percent
        except Exception:
            pass
    
    return {
        "database": db_status,
        "ml_engine": ml_status,
        "api_server": "operational",
        "memory_usage_mb": round(memory_usage, 2),
        "cpu_usage_percent": cpu_usage,
        "disk_usage_percent": disk_usage,
        "uptime_seconds": int(uptime_sec),
        "latency_ms": round(latency, 2),
        "server_time": datetime.now().isoformat()
    }

@router.post("/system/flush-cache")
def flush_system_cache(
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    """Reset system metrics and log the audit event."""
    from ..core.metrics import GLOBAL_METRICS
    GLOBAL_METRICS.reset()
    
    # Audit Log
    audit = models.AdminAuditLog(
        admin_id=admin.id,
        action="FLUSH_CACHE",
        details="System metrics and in-memory cache reset"
    )
    db.add(audit)
    db.commit()
    
    return {"message": "System metrics and cache flushed successfully"}

@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    """Fetch recent admin audit logs."""
    logs = db.query(models.AdminAuditLog)\
             .options(joinedload(models.AdminAuditLog.admin))\
             .order_by(models.AdminAuditLog.timestamp.desc())\
             .offset(skip).limit(limit).all()
             
    results = []
    for log in logs:
        results.append({
            "id": log.id,
            "admin_username": log.admin.username if log.admin else "Unknown",
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        })
    return results
