from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy import func

from backend.database.database import get_db
from backend.database.models import Target, WorkoutSession, Achievement
from backend.schemas.schemas import TargetCreate, TargetResponse, OverallProgressResponse, WeeklyExerciseProgress, AchievementResponse

router = APIRouter(
    prefix="/targets",
    tags=["Targets & Progress"]
)

@router.get("/", response_model=List[TargetResponse])
def get_targets(db: Session = Depends(get_db)):
    """Fetch all active targets for the default user (ID: 1)."""
    return db.query(Target).filter(Target.user_id == 1).all()

@router.post("/", response_model=TargetResponse)
def create_target(target_in: TargetCreate, db: Session = Depends(get_db)):
    """Set a new weekly target starting from today for 7 days."""
    today = date.today()
    end = today + timedelta(days=7)
    
    new_target = Target(
        exercise=target_in.exercise,
        weekly_rep_target=target_in.weekly_rep_target,
        start_date=today,
        end_date=end,
        user_id=1
    )
    db.add(new_target)
    db.commit()
    db.refresh(new_target)
    return new_target

@router.get("/progress", response_model=OverallProgressResponse)
def get_progress(db: Session = Depends(get_db)):
    """Calculate dynamic progress for every exercise based on active targets and actual sessions."""
    # 1. Get targets
    targets = db.query(Target).filter(Target.user_id == 1).all()
    
    # 2. Map of exercise -> target_reps
    target_map = {t.exercise: t.weekly_rep_target for t in targets}
    
    # 3. Aggregation of actual reps this week (today - 7 days)
    lookback = date.today() - timedelta(days=7)
    session_totals = db.query(
        WorkoutSession.exercise,
        func.sum(WorkoutSession.reps_actual).label("total_reps")
    ).filter(
        WorkoutSession.user_id == 1,
        WorkoutSession.date >= lookback
    ).group_by(WorkoutSession.exercise).all()
    
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

    exercise_progress = []
    total_reps_done = 0
    total_reps_target = 0

    for ex in standard_exercises:
        curr = actual_map.get(ex, 0)
        target = target_map.get(ex, 200) # Fallback target if none set
        
        perc = int((curr / target) * 100) if target > 0 else 0
        total_reps_done += curr
        total_reps_target += target
        
        exercise_progress.append(WeeklyExerciseProgress(
            exercise=ex,
            label=display_labels.get(ex, ex.capitalize()),
            current_reps=curr,
            target_reps=target,
            percent_complete=min(perc, 100),
            streak_days=3 # Hardcoded placeholder for streak logic
        ))

    # 5. Trend (Mocking 5 weeks for now, or fetching from DB if history exists)
    weekly_trend = [
        {"week": "Wk 01", "completion": 65},
        {"week": "Wk 02", "completion": 80},
        {"week": "Wk 03", "completion": 45},
        {"week": "Wk 04", "completion": 90},
        {"week": "Wk 05", "completion": 75},
    ]

    # 6. Achievements
    achievements = db.query(Achievement).filter(Achievement.user_id == 1).order_by(Achievement.unlocked_at.desc()).limit(3).all()

    overall_perc = int((total_reps_done / total_reps_target) * 100) if total_reps_target > 0 else 0

    return OverallProgressResponse(
        overall_percent=min(overall_perc, 100),
        total_reps_done=total_reps_done,
        total_reps_target=total_reps_target,
        exercise_progress=exercise_progress,
        recent_achievements=achievements,
        weekly_trend=weekly_trend
    )
