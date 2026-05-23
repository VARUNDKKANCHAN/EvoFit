"""
backend/routers/body_metrics.py
---------------------------------
CRUD endpoints for tracking user body composition over time.
Allows users to log weight and body fat percentage entries.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from backend.schemas.schemas import BodyMetricCreate, BodyMetricResponse

router = APIRouter(
    prefix="/body-metrics",
    tags=["Body Metrics"]
)


@router.get("/", response_model=List[BodyMetricResponse])
def get_body_metrics(
    limit: int = 90,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the current user's body metric history.
    Returns the most recent entries first, up to `limit` records (default 90 days).
    """
    entries = (
        db.query(models.BodyMetric)
        .filter(models.BodyMetric.user_id == current_user.id)
        .order_by(desc(models.BodyMetric.log_date))
        .limit(limit)
        .all()
    )
    return entries


@router.post("/", response_model=BodyMetricResponse, status_code=status.HTTP_201_CREATED)
def create_body_metric(
    data: BodyMetricCreate,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a new body metric entry (weight in kg, optional body fat %).
    One entry per day is recommended; duplicates on the same date are allowed for correction.
    """
    if data.weight <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Weight must be a positive number."
        )
    if data.body_fat_pct is not None and not (0 < data.body_fat_pct < 100):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Body fat percentage must be between 0 and 100."
        )

    entry = models.BodyMetric(
        user_id=current_user.id,
        weight=data.weight,
        body_fat_pct=data.body_fat_pct,
        log_date=data.log_date
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_body_metric(
    metric_id: int,
    current_user: models.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific body metric entry by ID.
    Users can only delete their own entries.
    """
    entry = db.query(models.BodyMetric).filter(
        models.BodyMetric.id == metric_id,
        models.BodyMetric.user_id == current_user.id
    ).first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Body metric entry not found."
        )

    db.delete(entry)
    db.commit()
    return None
