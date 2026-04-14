from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta
import json
from typing import List

from backend.database.database import get_db
from backend.database.models import WorkoutSession, Target, User, Achievement
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
    dates_raw = db.query(WorkoutSession.date).filter(
        WorkoutSession.user_id == user_id
    ).distinct().order_by(desc(WorkoutSession.date)).all()
    
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
def get_dashboard_summary(db: Session = Depends(get_db)):
    user_id = 1 # Default user
    today = date.today()
    last_week = today - timedelta(days=7)

    # 1. KPI Aggregations
    reps_week = db.query(func.sum(WorkoutSession.reps_actual)).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= last_week
    ).scalar() or 0

    avg_form = db.query(func.avg(WorkoutSession.form_score)).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= last_week
    ).scalar() or 0.0

    # For consistency, we'll fetch recently processed sessions to pull rhythm from JSON if available
    # But for a summary, we use a proxy from form scores or average rhythm stored in sessions
    # Here we'll take the global avg of rhythm stored in the most recent sessions
    recent_sessions_raw = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id
    ).order_by(desc(WorkoutSession.date)).limit(10).all()

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
        day_reps = db.query(func.sum(WorkoutSession.reps_actual)).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.date == d
        ).scalar() or 0
        day_quality = db.query(func.avg(WorkoutSession.form_score)).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.date == d
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
        WorkoutSession.exercise,
        func.sum(WorkoutSession.reps_actual)
    ).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= last_week
    ).group_by(WorkoutSession.exercise).all()

    distribution = [
        DistributionItem(
            name=ex.capitalize(),
            value=reps,
            fill=EXERCISE_COLORS.get(ex.lower(), "#7C3AED")
        ) for ex, reps in dist_raw
    ]

    # 5. Targets (Active Goals)
    active_targets_raw = db.query(Target).filter(
        Target.user_id == user_id,
        Target.end_date >= today
    ).order_by(Target.end_date).limit(4).all()

    targets = []
    for tgt in active_targets_raw:
        # Calculate reps done for this target's timeframe
        reps_done_query = db.query(func.sum(WorkoutSession.reps_actual)).filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.exercise == tgt.exercise,
            WorkoutSession.date >= tgt.start_date,
            WorkoutSession.date <= tgt.end_date
        ).scalar() or 0
        
        pct = min(100, int((reps_done_query / tgt.weekly_rep_target) * 100)) if tgt.weekly_rep_target > 0 else 0
        
        targets.append({
            "label": f"{tgt.exercise.capitalize()} Volume",
            "reps_done": int(reps_done_query),
            "reps_target": tgt.weekly_rep_target,
            "completion_pct": pct,
            "icon_type": "activity"
        })

    # 6. AI Insights (Only added if there's enough data)
    insights = []
    if reps_week > 100:
        insights.append(f"You've lifted {reps_week} reps this week. Keep up the momentum!")
    if avg_form >= 90:
        insights.append("Your technique is exceptional. Consider increasing intensity.")
    
    if not recent_sessions and not reps_week:
        insights = [] # Keep empty if new user

    user = db.query(User).filter(User.id == user_id).first()
    recent_achievements = db.query(Achievement).filter(Achievement.user_id == user_id).order_by(Achievement.unlocked_at.desc()).limit(3).all()
    
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
