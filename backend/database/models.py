from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    sessions = relationship("WorkoutSession", back_populates="user")
    targets = relationship("Target", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")
    metrics = relationship("BodyMetric", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String)
    age = Column(Integer)
    weight_kg = Column(Float)
    height_cm = Column(Float)
    gender = Column(String) # male, female, other
    fitness_goal = Column(String) # e.g., "Strength", "Hypertrophy", "Weight Loss"
    
    user = relationship("User", back_populates="profile")

class Target(Base):
    __tablename__ = "targets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exercise = Column(String, index=True, nullable=False)
    weekly_rep_target = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="targets")

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=func.current_date())
    exercise = Column(String, index=True)
    reps_actual = Column(Integer)
    form_score = Column(Float)
    duration_sec = Column(Float, nullable=True)
    mean_power = Column(Float, nullable=True)
    # Store dynamic AI breakdown as JSON string
    json_report = Column(String, nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="achievements")

class BodyMetric(Base):
    """Tracks physical progress like weight and body fat over time"""
    __tablename__ = "body_metrics"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    weight = Column(Float)
    body_fat_pct = Column(Float, nullable=True)
    log_date = Column(Date, default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="metrics")
