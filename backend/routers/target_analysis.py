from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta
from typing import List, Dict, Any

from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.schemas.schemas import TargetAnalysisResponse

router = APIRouter(
    prefix="/exercise-analysis",
    tags=["Target Analysis"]
)

@router.get("/{exercise}", response_model=TargetAnalysisResponse)
def get_target_analysis(
    exercise: str,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch comprehensive historical analysis for a specific exercise target.
    Includes progression, consistency trends, and personal bests.
    """
    user_id = current_user.id
    
    # 1. Fetch historical sessions for this exercise
    sessions = db.query(models.WorkoutSession).filter(
        models.WorkoutSession.user_id == user_id,
        models.WorkoutSession.exercise == exercise
    ).order_by(models.WorkoutSession.date.asc()).all()

    if not sessions:
        return {
            "exercise": exercise,
            "has_data": False,
            "current_target": 0,
            "personal_bests": None,
            "progression": [],
            "avg_recent_form": 0.0,
            "insights": [],
            "message": f"No historical data found for {exercise}."
        }

    # 2. Calculate progression data (Reps & Quality)
    progression = []
    for s in sessions:
        progression.append({
            "date": s.date.strftime("%Y-%m-%d"),
            "reps": s.reps_actual,
            "quality": round(s.form_score, 1)
        })

    # 3. Personal Bests
    max_reps = max(s.reps_actual for s in sessions)
    best_form = max(s.form_score for s in sessions)
    total_volume = sum(s.reps_actual for s in sessions)
    
    # 4. Consistency Trend (Rolling Average of Form)
    # Just use last 5 sessions for a quick trend
    recent_sessions = sessions[-5:]
    avg_recent_form = sum(s.form_score for s in recent_sessions) / len(recent_sessions) if recent_sessions else 0

    # 5. Get current target for this exercise
    target = db.query(models.Target).filter(
        models.Target.user_id == user_id,
        models.Target.exercise == exercise
    ).order_by(models.Target.created_at.desc()).first()
    
    target_reps = target.weekly_rep_target if target else 0

    # 6. Comparative Insights
    insights = []
    if len(progression) >= 2:
        prev_reps = progression[-2]["reps"]
        curr_reps = progression[-1]["reps"]
        if curr_reps > prev_reps:
            insights.append(f"Volume increased by {curr_reps - prev_reps} reps since your last session. Progressive overload in action!")
        elif curr_reps < prev_reps:
            insights.append("Volume dropped slightly. Ensure you're hitting your target recovery windows.")
            
    if avg_recent_form > 90:
        insights.append("Your technique is rock solid. You're ready to increase the weight or complexity.")
    elif avg_recent_form < 70:
        insights.append("Form has been dipping recently. Focus on core stability and controlled eccentric phases.")

    return {
        "exercise": exercise,
        "has_data": True,
        "current_target": target_reps,
        "personal_bests": {
            "max_reps": max_reps,
            "best_form": round(best_form, 1),
            "total_volume": total_volume,
            "session_count": len(sessions)
        },
        "progression": progression,
        "avg_recent_form": round(avg_recent_form, 1),
        "insights": insights
    }
