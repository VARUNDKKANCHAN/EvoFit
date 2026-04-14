from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import json
from datetime import date, timedelta
from backend.database.database import get_db
from backend.database.models import WorkoutSession
from backend.schemas.schemas import SessionItem

router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"]
)

@router.get("/", response_model=List[SessionItem])
def get_all_sessions(
    days: Optional[int] = None,
    exercise: Optional[str] = None,
    db: Session = Depends(get_db)
):
    user_id = 1
    query = db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id)
    
    if days is not None:
        lookback = date.today() - timedelta(days=days)
        query = query.filter(WorkoutSession.date >= lookback)
        
    if exercise:
        query = query.filter(WorkoutSession.exercise.ilike(f"%{exercise}%"))
        
    sessions = query.order_by(desc(WorkoutSession.date), desc(WorkoutSession.created_at)).all()
    
    # Map to SessionItem format
    result = []
    for s in sessions:
        sparkline = []
        if s.json_report:
            try:
                report = json.loads(s.json_report)
                sparkline = [r.get("score", 0) for r in report.get("rep_details", [])]
            except: pass
        
        if not sparkline:
            sparkline = [s.form_score] * 5 # Fallback
            
        result.append(SessionItem(
            id=s.id,
            date=s.date,
            exercise=s.exercise,
            reps=s.reps_actual,
            form_score=round(s.form_score, 1),
            consistency=round(s.form_score * 0.95, 1), # Consistency proxy
            sparkline_data=sparkline[:12]
        ))
    return result

@router.get("/{session_id}")
def get_session_detail(session_id: int, db: Session = Depends(get_db)):
    session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.json_report:
        return {"id": session.id, "error": "No detailed report available for this session"}
        
    report_data = json.loads(session.json_report)
    
    # Restructure into PredictionResponse format so Analytics.jsx can parse it correctly
    return {
        "confidence": session.form_score / 100.0,
        "duration": report_data.get("summary", {}).get("duration", "N/A"),
        "time_range": report_data.get("summary", {}).get("time_range", "N/A"),
        "overall_consistency": report_data.get("summary", {}).get("overall_consistency", "0%"),
        "exercise_breakdown": [
            {
                "label": session.exercise,
                "rep_count": session.reps_actual,
                "confidence": session.form_score / 100.0,
                "rep_details": report_data.get("rep_details", []),
                "set_details": report_data.get("set_details", []),
                "rhythm_waveform": report_data.get("rhythm_waveform", [])
            }
        ],
        "analysis_json": report_data,
        "leveled_up": False,
        "new_xp_total": 0,
        "new_achievements": []
    }
