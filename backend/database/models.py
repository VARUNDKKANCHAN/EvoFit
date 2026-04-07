from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    # Placeholder for future user auth, currently we assume a default user

class Target(Base):
    __tablename__ = "targets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1) # Defaulting to 1 for MVP
    exercise = Column(String, index=True, nullable=False) # bench, dead, squat, ohp, row
    weekly_rep_target = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    date = Column(Date, default=func.current_date())
    exercise = Column(String, index=True)
    reps_actual = Column(Integer)
    form_score = Column(Float)
    duration_sec = Column(Float, nullable=True)
    mean_power = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Achievement(Base):
    """Stores unlocked badges dynamically"""
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    badge_name = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String) # e.g. "medal", "star"
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
