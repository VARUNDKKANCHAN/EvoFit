"""
backend/schemas/schemas.py
---------------------------
Pydantic models for API request/response validation.
These define exactly what the frontend receives as JSON.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Dict, List, Optional, Any
from datetime import date, datetime


class RepDetail(BaseModel):
    rep: int
    score: float
    rhythm: float
    peak_index: int
    wobble: Optional[float] = 0.0
    concentric_sec: Optional[float] = 0.0
    eccentric_sec: Optional[float] = 0.0

class RhythmWaveform(BaseModel):
    time: int
    ideal: float
    actual: float

class SetDetail(BaseModel):
    set_num: int
    reps: int
    confidence: float
    mean_power: Optional[float] = 0.0
    rest_before_sec: Optional[float] = 0.0

class ExerciseBreakdown(BaseModel):
    label: str
    rep_count: int
    set_details: List[SetDetail]
    rep_details: List[RepDetail]
    rhythm_waveform: List[RhythmWaveform]

class PredictionResponse(BaseModel):
    """Returned by POST /predict/"""
    predicted_label: str          # e.g. "bench"
    confidence:      float        # 0.0 – 1.0
    probabilities:   Dict[str, float]  # {"bench": 0.91, "squat": 0.04, ...}
    rep_count:       int          # detected repetitions
    row_count:       int          # number of sensor samples in the CSV
    feature_count:   int          # number of features used by the model
    model_accuracy:  float        # overall model accuracy from training
    exercise_breakdown: Optional[List[ExerciseBreakdown]] = None
    duration:        Optional[str] = None
    time_range:      Optional[str] = None
    overall_consistency: Optional[str] = None
    best_set_summary: Optional[str] = None


class MetricsResponse(BaseModel):
    """Returned by GET /predict/metrics"""
    accuracy:         float
    classes:          list
    feature_count:    int
    confusion_matrix: list        # 2-D list (JSON-serialisable)
    report:           dict



class ErrorResponse(BaseModel):
    detail: str


# --- USER & PROFILE SCHEMAS ---

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    fitness_goal: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- BODY METRICS ---

class BodyMetricBase(BaseModel):
    weight: float
    body_fat_pct: Optional[float] = None
    log_date: date

class BodyMetricCreate(BodyMetricBase):
    pass

class BodyMetricResponse(BodyMetricBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- TARGETS & PROGRESS SCHEMAS ---

class TargetBase(BaseModel):
    exercise: str
    weekly_rep_target: int
    start_date: date
    end_date: date

class TargetCreate(BaseModel):
    exercise: str
    weekly_rep_target: int

class TargetResponse(TargetBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AchievementResponse(BaseModel):
    id: int
    badge_name: str
    description: str
    icon: str
    unlocked_at: datetime

    class Config:
        from_attributes = True

class WeeklyExerciseProgress(BaseModel):
    exercise: str
    label: str
    current_reps: int
    target_reps: int
    percent_complete: int
    streak_days: int

class OverallProgressResponse(BaseModel):
    overall_percent: int
    total_reps_done: int
    total_reps_target: int
    current_streak: int
    overall_form_score: Optional[float] = 0.0
    exercise_progress: List[WeeklyExerciseProgress]
    recent_achievements: List[AchievementResponse]
    weekly_trend: List[Dict[str, Any]] # e.g. [{"week": "Week 1", "completion": 75.0}]
