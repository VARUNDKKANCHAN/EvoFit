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
    leveled_up:      Optional[bool] = False
    new_xp_total:    Optional[int] = 0


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
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    fitness_goal: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    xp: int
    level: int

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

class TrophyRoomResponse(BaseModel):
    level: int
    xp: int
    total_badges: int
    achievements: List[AchievementResponse]

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

class TargetAnalysisPoint(BaseModel):
    date: str
    reps: int
    quality: float

class PersonalBests(BaseModel):
    max_reps: int
    best_form: float
    total_volume: int
    session_count: int

class TargetAnalysisResponse(BaseModel):
    exercise: str
    has_data: bool
    current_target: int
    personal_bests: Optional[PersonalBests] = None
    progression: Optional[List[TargetAnalysisPoint]] = []
    avg_recent_form: Optional[float] = 0.0
    insights: Optional[List[str]] = []
    message: Optional[str] = None
# --- DASHBOARD SCHEMAS ---

class SessionItem(BaseModel):
    id: int
    date: date
    exercise: str
    reps: int
    form_score: float
    consistency: float
    sparkline_data: List[float]

class DashboardTargetItem(BaseModel):
    label: str
    reps_done: int
    reps_target: int
    completion_pct: int
    icon_type: str           # e.g. "activity", "clock", "trending"
    is_achieved: bool = False
    status: str = "active"   # "active" | "achieved" | "expired"

class TrendPoint(BaseModel):
    date: str
    reps: int
    quality: float

class DistributionItem(BaseModel):
    name: str
    value: int
    fill: str

class UserProgression(BaseModel):
    xp: int
    level: int
    xp_to_next_level: int

class KPIStats(BaseModel):
    total_reps_lifted: int
    avg_form_score: float
    consistency_score: float
    active_streak: int

class DashboardSummaryResponse(BaseModel):
    kpis: KPIStats
    user_progression: UserProgression
    recent_achievements: List[AchievementResponse]
    trend_data: List[TrendPoint]
    recent_sessions: List[SessionItem]
    distribution: List[DistributionItem]
    targets: List[DashboardTargetItem]
    insights: List[str]
    recovery_estimate: Optional[str] = None

# --- AUTH SCHEMAS ---

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class MeResponse(BaseModel):
    """Combined User + Profile response for a single-call login/auth check."""
    id: int
    username: str
    email: str
    xp: int
    level: int
    created_at: datetime
    is_active: bool
    # Profile fields
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    fitness_goal: Optional[str] = None

    class Config:
        from_attributes = True

class LeaderboardUser(BaseModel):
    id: int
    username: str
    xp: int
    level: int
    rank: int
    is_current_user: bool

class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardUser]
    current_user_rank: int
    current_user_xp: int
    percentile: Optional[int] = 100
    total_count: Optional[int] = 0
