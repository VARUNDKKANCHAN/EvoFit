from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta
import json
from typing import List

from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.schemas.schemas import DashboardSummaryResponse, KPIStats, TrendPoint, SessionItem, DistributionItem, DashboardTargetItem, UserProgression

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

EXERCISE_COLORS = {
    "bench": "#7C3AED",
    "dead": "#3B82F6",
    "squat": "#34D399",
    "ohp": "#F472B6",
    "row": "#9CA3AF"
}

def get_active_streak(db: Session, user_id: int) -> int:
    """Calculate the current consecutive day streak for a user."""
    # Simple Python implementation for SQLite compatibility and clarity
    dates_raw = db.query(models.WorkoutSession.date).filter(
        models.WorkoutSession.user_id == user_id
    ).distinct().order_by(desc(models.WorkoutSession.date)).all()
    
    dates = [d[0] for d in dates_raw]
    
    if not dates: return 0
    
    today = date.today()
    # Check if they at least worked out today or yesterday
    if dates[0] < today - timedelta(days=1):
        return 0
        
    streak = 1
    for i in range(len(dates) - 1):
        if (dates[i] - dates[i+1]).days == 1:
            streak += 1
        else:
            break
    return streak

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    today = date.today()
    last_week = today - timedelta(days=7)

    # 1. KPI Aggregations
    reps_week = db.query(func.sum(models.WorkoutSession.reps_actual)).filter(
        models.WorkoutSession.user_id == user_id,
        models.WorkoutSession.date >= last_week
    ).scalar() or 0

    avg_form = db.query(func.avg(models.WorkoutSession.form_score)).filter(
        models.WorkoutSession.user_id == user_id,
        models.WorkoutSession.date >= last_week
    ).scalar() or 0.0

    # For consistency, we'll fetch recently processed sessions to pull rhythm from JSON if available
    recent_sessions_raw = db.query(models.WorkoutSession).filter(
        models.WorkoutSession.user_id == user_id
    ).order_by(desc(models.WorkoutSession.date)).limit(10).all()

    total_rhythm = 0
    rhythm_count = 0
    for s in recent_sessions_raw:
        if s.json_report:
            try:
                report = json.loads(s.json_report)
                reps = report.get("rep_details", [])
                for r in reps:
                    total_rhythm += r.get("rhythm", 0)
                    rhythm_count += 1
            except: pass

    avg_consistency = (total_rhythm / rhythm_count) if rhythm_count > 0 else 0.0

    # 2. Trend Data (Last 7 Days)
    trend_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_reps = db.query(func.sum(models.WorkoutSession.reps_actual)).filter(
            models.WorkoutSession.user_id == user_id,
            models.WorkoutSession.date == d
        ).scalar() or 0
        day_quality = db.query(func.avg(models.WorkoutSession.form_score)).filter(
            models.WorkoutSession.user_id == user_id,
            models.WorkoutSession.date == d
        ).scalar() or 0.0
        
        trend_data.append(TrendPoint(
            date=d.strftime("%a"),
            reps=day_reps,
            quality=round(float(day_quality), 1)
        ))

    # 3. Recent Sessions Table
    recent_sessions = []
    for s in recent_sessions_raw[:5]:
        sparkline = []
        if s.json_report:
            try:
                report = json.loads(s.json_report)
                sparkline = [r.get("score", 0) for r in report.get("rep_details", [])]
            except: pass
        
        # Fallback sparkline if no JSON
        if not sparkline:
            sparkline = [s.form_score] * s.reps_actual if s.reps_actual < 12 else [s.form_score] * 12

        recent_sessions.append(SessionItem(
            id=s.id,
            date=s.date,
            exercise=s.exercise,
            reps=s.reps_actual,
            form_score=round(s.form_score, 1),
            consistency=round(s.form_score * 0.95, 1), # Proxy for consistency if direct metric missing
            sparkline_data=sparkline[:12] # Limit sparkline points
        ))

    # 4. Exercise Distribution
    dist_raw = db.query(
        models.WorkoutSession.exercise,
        func.sum(models.WorkoutSession.reps_actual)
    ).filter(
        models.WorkoutSession.user_id == user_id,
        models.WorkoutSession.date >= last_week
    ).group_by(models.WorkoutSession.exercise).all()

    distribution = [
        DistributionItem(
            name=(ex or "Exercise").capitalize(),
            value=reps,
            fill=EXERCISE_COLORS.get((ex or "unknown").lower(), "#7C3AED")
        ) for ex, reps in dist_raw
    ]

    # 5. Targets logic
    DEFAULT_TARGETS = {"bench": 300, "dead": 150, "squat": 250, "ohp": 200, "row": 300}
    EXERCISE_LABELS_MAP = {"bench": "Bench Press", "dead": "Deadlift", "squat": "Back Squat", "ohp": "Overhead Press", "row": "Barbell Row"}

    user_target_rows = db.query(models.Target).filter(
        models.Target.user_id == user_id,
        models.Target.start_date <= today,
        models.Target.end_date >= today
    ).order_by(models.Target.created_at.asc()).all()
    target_map = {t.exercise: t.weekly_rep_target for t in user_target_rows}

    # Step B: actual reps for each exercise in last 7 days
    session_totals = db.query(
        models.WorkoutSession.exercise,
        func.sum(models.WorkoutSession.reps_actual).label("total_reps")
    ).filter(
        models.WorkoutSession.user_id == user_id,
        models.WorkoutSession.date >= last_week
    ).group_by(models.WorkoutSession.exercise).all()
    actual_map = {s.exercise: int(s.total_reps) for s in session_totals}

    # Step C: build target cards for the 5 main exercises, capped at 4 for dashboard
    targets = []
    STANDARD_EXERCISES = ["bench", "dead", "squat", "ohp", "row"]
    for ex in STANDARD_EXERCISES:
        reps_done = actual_map.get(ex, 0)
        rep_target = target_map.get(ex, DEFAULT_TARGETS.get(ex, 200))
        pct = min(100, int((reps_done / rep_target) * 100)) if rep_target > 0 else 0
        is_achieved = pct >= 100
        targets.append({
            "label": f"{EXERCISE_LABELS_MAP.get(ex, ex.capitalize())} Volume",
            "reps_done": reps_done,
            "reps_target": rep_target,
            "completion_pct": pct,
            "icon_type": "activity",
            "is_achieved": is_achieved,
            "status": "achieved" if is_achieved else "active"
        })

    # Sort: achieved first, then by completion % desc; keep top 4
    targets.sort(key=lambda x: (-x["is_achieved"], -x["completion_pct"]))
    targets = targets[:4]

    # 6. AI Insights
    insights = []
    if reps_week > 100:
        insights.append(f"You've lifted {reps_week} reps this week. Keep up the momentum!")
    if avg_form >= 90:
        insights.append("Your technique is exceptional. Consider increasing intensity.")
    
    if not recent_sessions and not reps_week:
        insights = [] # Keep empty if new user

    user = db.query(models.User).filter(models.User.id == user_id).first()
    recent_achievements = db.query(models.Achievement).filter(models.Achievement.user_id == user_id).order_by(models.Achievement.unlocked_at.desc()).limit(3).all()
    
    return DashboardSummaryResponse(
        kpis=KPIStats(
            total_reps_lifted=reps_week,
            avg_form_score=round(float(avg_form), 1),
            consistency_score=round(float(avg_consistency), 1),
            active_streak=get_active_streak(db, user_id)
        ),
        user_progression=UserProgression(
            xp=user.xp if user else 0,
            level=user.level if user else 1,
            xp_to_next_level=(user.level if user else 1) * 1000
        ),
        recent_achievements=recent_achievements,
        trend_data=trend_data,
        recent_sessions=recent_sessions,
        distribution=distribution,
        targets=targets,
        insights=insights
    )
