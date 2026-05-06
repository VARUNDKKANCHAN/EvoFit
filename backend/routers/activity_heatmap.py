from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Dict

from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.schemas.schemas import ActivityHeatmapResponse

router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)

@router.get("/heatmap", response_model=ActivityHeatmapResponse)
def get_activity_heatmap(
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Returns workout activity intensity for the last 365 days."""
    today = date.today()
    one_year_ago = today - timedelta(days=365)
    
    # Query daily rep totals for the last year
    results = db.query(
        models.WorkoutSession.date,
        func.sum(models.WorkoutSession.reps_actual)
    ).filter(
        models.WorkoutSession.user_id == current_user.id,
        models.WorkoutSession.date >= one_year_ago
    ).group_by(models.WorkoutSession.date).all()
    
    # Convert to Dict[date_str, intensity]
    activity_map = {str(r[0]): int(r[1]) for r in results}
    
    return ActivityHeatmapResponse(activity=activity_map)
