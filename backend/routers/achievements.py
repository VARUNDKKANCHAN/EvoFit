from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.schemas.schemas import AchievementResponse, TrophyRoomResponse

router = APIRouter(
    prefix="/achievements",
    tags=["Achievements"]
)

@router.get("/", response_model=TrophyRoomResponse)
def get_achievements(current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    user = db.query(models.User).filter(models.User.id == user_id).first()
    badges = db.query(models.Achievement).filter(models.Achievement.user_id == user_id).order_by(models.Achievement.unlocked_at.desc()).all()
    
    return {
        "level": user.level if user else 1,
        "xp": user.xp if user else 0,
        "total_badges": len(badges),
        "achievements": badges
    }
