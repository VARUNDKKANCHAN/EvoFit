from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.database.models import Achievement
from backend.schemas.schemas import AchievementResponse

router = APIRouter(
    prefix="/achievements",
    tags=["Achievements"]
)

@router.get("/", response_model=List[AchievementResponse])
def get_achievements(db: Session = Depends(get_db)):
    user_id = 1  # Default user for now
    badges = db.query(Achievement).filter(Achievement.user_id == user_id).order_by(Achievement.unlocked_at.desc()).all()
    return badges
