from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.database.models import Achievement, User
from backend.schemas.schemas import AchievementResponse, TrophyRoomResponse

router = APIRouter(
    prefix="/achievements",
    tags=["Achievements"]
)

@router.get("/", response_model=TrophyRoomResponse)
def get_achievements(db: Session = Depends(get_db)):
    user_id = 1  # Default user for now
    user = db.query(User).filter(User.id == user_id).first()
    badges = db.query(Achievement).filter(Achievement.user_id == user_id).order_by(Achievement.unlocked_at.desc()).all()
    
    return {
        "level": user.level if user else 1,
        "xp": user.xp if user else 0,
        "total_badges": len(badges),
        "achievements": badges
    }
