from backend.services.ml_service import predict_from_upload, get_metrics
from backend.database.database import get_db
from backend.database.models import WorkoutSession, Achievement
from sqlalchemy.orm import Session
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

ALLOWED_EXTENSIONS = {".csv", ".pkl"}

@router.post("/")
async def predict_exercise(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a sensor data file (.csv or .pkl).
    Saves results to the database and detects new achievements.
    """
    import os
    ext = os.path.splitext(file.filename.lower())[1]

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Upload a .csv or .pkl file."
        )

    try:
        file_bytes = await file.read()
        result = predict_from_upload(file_bytes, file.filename)
        
        # --- SAVE TO DATABASE ---
        for ex in result.get("exercise_breakdown", []):
            label = ex.get("label")
            reps = ex.get("rep_count", 0)
            avg_conf = result.get("confidence", 0)
            
            sets = ex.get("set_details", [])
            avg_power = sum(s.get("mean_power", 0) for s in sets) / len(sets) if sets else 0
            
            session_row = WorkoutSession(
                exercise=label,
                reps_actual=reps,
                form_score=float(avg_conf * 100),
                mean_power=avg_power,
                user_id=1
            )
            db.add(session_row)
        
        db.commit()

        # Achievement logic
        new_badges = []
        for ex in result.get("exercise_breakdown", []):
            label = ex.get("label")
            from sqlalchemy import func
            total_ever = db.query(func.sum(WorkoutSession.reps_actual)).filter(WorkoutSession.exercise == label).scalar() or 0
            
            if total_ever >= 500:
                badge = f"500 {label.capitalize()} Reps Club"
                exists = db.query(Achievement).filter(Achievement.badge_name == badge).first()
                if not exists:
                    new_achive = Achievement(
                        badge_name=badge, 
                        description=f"You've smashed 500 total reps of {label}!", 
                        icon="star"
                    )
                    db.add(new_achive)
                    new_badges.append(badge)
        
        db.commit()
        result["new_achievements"] = new_badges

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database or Predict error: {e}")
    
    return result


@router.get("/metrics")
async def model_metrics():
    """Returns model accuracy, class list, feature count, and confusion matrix."""
    try:
        info = get_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load model info: {e}")

    return JSONResponse(content={
        "status":           "success",
        "accuracy":         info["accuracy"],
        "classes":          info["classes"],
        "feature_count":    info["feature_count"],
        "confusion_matrix": info["confusion_matrix"],
    })
