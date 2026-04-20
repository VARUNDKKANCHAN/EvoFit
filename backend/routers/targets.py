from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy import func
import random

from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.schemas.schemas import TargetCreate, TargetResponse, OverallProgressResponse, WeeklyExerciseProgress, AchievementResponse

router = APIRouter(
    prefix="/targets",
    tags=["Targets & Progress"]
)

def calculate_streak(db: Session, user_id: int, exercise: Optional[str] = None) -> int:
    """Calculate the current consecutive day streak for a user/exercise."""
    query = db.query(models.WorkoutSession.date).filter(models.WorkoutSession.user_id == user_id).distinct()
    if exercise:
        query = query.filter(models.WorkoutSession.exercise == exercise)
    
    dates = [row[0] for row in query.order_by(models.WorkoutSession.date.desc()).all()]
    if not dates:
        return 0
    
    # Check if the streak is still active (today or yesterday)
    today = date.today()
    if dates[0] < today - timedelta(days=1):
        return 0
    
    streak = 1
    for i in range(len(dates) - 1):
        if dates[i] - dates[i+1] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak

def calculate_weekly_trend(db: Session, user_id: int) -> List[dict]:
    """Calculate completion percentage for the last 5 weeks."""
    trend = []
    today = date.today()
    
    # We want 5 weeks ending today
    for i in range(4, -1, -1):
        end_date = today - timedelta(weeks=i)
        start_date = end_date - timedelta(days=6)
        week_label = f"Wk {5-i:02d}"
        
        # Get target for this period (using current target as proxy if no historical record)
        target_sum = db.query(func.sum(models.Target.weekly_rep_target)).filter(
            models.Target.user_id == user_id,
            models.Target.start_date <= end_date,
            models.Target.end_date >= start_date
        ).scalar() or 500 # Global fallback
        
        # Get actual reps for this period
        actual_sum = db.query(func.sum(models.WorkoutSession.reps_actual)).filter(
            models.WorkoutSession.user_id == user_id,
            models.WorkoutSession.date <= end_date,
            models.WorkoutSession.date >= start_date
        ).scalar() or 0
        
        completion = int((actual_sum / target_sum) * 100) if target_sum > 0 else 0
        trend.append({"week": week_label, "completion": min(completion, 100)})
        
    return trend

@router.get("/", response_model=List[TargetResponse])
def get_targets(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Fetch all active targets for the authenticated user."""
    return db.query(models.Target).filter(models.Target.user_id == current_user.id).all()

@router.post("/", response_model=TargetResponse)
def create_target(target_in: TargetCreate, current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Set a new weekly target starting from today for 7 days."""
    today = date.today()
    end = today + timedelta(days=7)
    
    new_target = models.Target(
        exercise=target_in.exercise,
        weekly_rep_target=target_in.weekly_rep_target,
        start_date=today,
        end_date=end,
        user_id=current_user.id
    )
    db.add(new_target)
    db.commit()
    db.refresh(new_target)
    return new_target

@router.get("/progress", response_model=OverallProgressResponse)
def get_progress(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Calculate dynamic progress for every exercise based on active targets and actual sessions."""
    # 1. Get targets
    targets = db.query(models.Target).filter(models.Target.user_id == current_user.id).all()
    
    # 2. Map of exercise -> target_reps
    target_map = {t.exercise: t.weekly_rep_target for t in targets}
    
    # 3. Aggregation of actual reps and form score this week (today - 7 days)
    lookback = date.today() - timedelta(days=7)
    
    # Rep totals
    session_totals = db.query(
        models.WorkoutSession.exercise,
        func.sum(models.WorkoutSession.reps_actual).label("total_reps")
    ).filter(
        models.WorkoutSession.user_id == current_user.id,
        models.WorkoutSession.date >= lookback
    ).group_by(models.WorkoutSession.exercise).all()
    
    # Average form score for the week
    avg_form = db.query(
        func.avg(models.WorkoutSession.form_score)
    ).filter(
        models.WorkoutSession.user_id == current_user.id,
        models.WorkoutSession.date >= lookback
    ).scalar() or 0.0

    actual_map = {s.exercise: s.total_reps for s in session_totals}
    
    # 4. Standard list of exercises to ensure we show 6 items in grid (as per design)
    standard_exercises = ["bench", "dead", "squat", "ohp", "row", "pullups"] # added pullups to make 6
    display_labels = {
        "bench": "Bench Press",
        "dead": "Deadlift",
        "squat": "Back Squat",
        "ohp": "Overhead Press",
        "row": "Barbell Row",
        "pullups": "Pull Ups"
    }

    # 4. Global Streak
    overall_streak = calculate_streak(db, current_user.id)

    # 5. Default Target Mapping (If no target set by user)
    DEFAULT_TARGETS = {
        "bench": 300,
        "dead": 150,
        "squat": 250,
        "ohp": 200,
        "row": 300,
        "pullups": 50
    }

    exercise_progress = []
    total_reps_done = 0
    total_reps_target = 0

    for ex in standard_exercises:
        curr = actual_map.get(ex, 0)
        target = target_map.get(ex, DEFAULT_TARGETS.get(ex, 200))
        
        perc = int((curr / target) * 100) if target > 0 else 0
        total_reps_done += curr
        total_reps_target += target
        
        # Calculate per-exercise streak
        ex_streak = calculate_streak(db, current_user.id, exercise=ex)

        exercise_progress.append(WeeklyExerciseProgress(
            exercise=ex,
            label=display_labels.get(ex, ex.capitalize()),
            current_reps=curr,
            target_reps=target,
            percent_complete=min(perc, 100),
            streak_days=ex_streak
        ))

    # 5. Dynamic Trend
    weekly_trend = calculate_weekly_trend(db, current_user.id)

    # 6. Check for Dynamic "High Consistency Award"
    if avg_form > 92.0:
        badge = "High Consistency Award"
        exists = db.query(models.Achievement).filter(models.Achievement.user_id == current_user.id, models.Achievement.badge_name == badge).first()
        if not exists:
            new_achieve = models.Achievement(
                user_id=current_user.id,
                badge_name=badge,
                description="Your average form score this week is over 92%! Exceptional control.",
                icon="shield-check"
            )
            db.add(new_achieve)
            db.commit()

    # 7. Achievements
    achievements = db.query(models.Achievement).filter(models.Achievement.user_id == current_user.id).order_by(models.Achievement.unlocked_at.desc()).limit(3).all()

    overall_perc = int((total_reps_done / total_reps_target) * 100) if total_reps_target > 0 else 0

    return OverallProgressResponse(
        overall_percent=min(overall_perc, 100),
        total_reps_done=total_reps_done,
        total_reps_target=total_reps_target,
        current_streak=overall_streak,
        overall_form_score=round(float(avg_form), 1),
        exercise_progress=exercise_progress,
        recent_achievements=achievements,
        weekly_trend=weekly_trend
    )


@router.get("/achievements", response_model=List[AchievementResponse])
def get_all_achievements(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Fetch all achievements for the authenticated user, most recent first."""
    return db.query(models.Achievement).filter(models.Achievement.user_id == current_user.id).order_by(models.Achievement.unlocked_at.desc()).all()
