"""
backend/schemas/schemas.py
---------------------------
Pydantic models for API request/response validation.
These define exactly what the frontend receives as JSON.
"""

from pydantic import BaseModel
from typing import Dict, List, Optional


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
