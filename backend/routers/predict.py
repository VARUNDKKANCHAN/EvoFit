from backend.services.ml_service import predict_from_upload, get_metrics
from backend.database.database import get_db
from backend.services import auth_service
from backend.database import models
from sqlalchemy.orm import Session
from datetime import date
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import json
from typing import List
from backend.services.chat_service import chat_service
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

ALLOWED_EXTENSIONS = {".csv", ".pkl"}

@router.post("/")
async def predict_exercise(file: UploadFile = File(...), current_user: models.User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
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
        user_id = current_user.id
        session_date_str = result.get("session_date")
        session_date = date.fromisoformat(session_date_str) if session_date_str else date.today()
        
        for ex in result.get("exercise_breakdown", []):
            label = ex.get("label")
            reps = ex.get("rep_count", 0)
            avg_conf = ex.get("avg_confidence", result.get("confidence", 0))
            
            sets = ex.get("set_details", [])
            avg_power = sum(s.get("mean_power", 0) for s in sets) / len(sets) if sets else 0
            
            # Store the individual exercise breakdown as JSON for specific re-rendering later
            report_data = {
                "rep_details": ex.get("rep_details", []),
                "set_details": ex.get("set_details", []),
                "rhythm_waveform": ex.get("rhythm_waveform", []),
                "summary": {
                    "duration": result.get("duration"),
                    "time_range": result.get("time_range"),
                    "overall_consistency": result.get("overall_consistency"),
                    "best_set_summary": result.get("best_set_summary", "N/A"),
                    "ai_insight": "Your strongest recorded performance interval was based on combined volume density."
                }
            }
            
            try:
                # Optimized prompt to be data-driven and avoid hallucinations like "100 reps"
                prompt = (
                    f"User finished {label} exercise. Reps: {reps}. Form: {avg_conf * 100:.1f}%. "
                    f"Best set summary: {result.get('best_set_summary')}. Consistency: {result.get('overall_consistency')}. "
                    "Provide a short, motivating RPG-style announcer observation. "
                    "Focus on form and effort. DO NOT mention specific numbers unless they are provided in the data above. "
                    "Keep it under 15 words. No quotes."
                )
                msg = [SystemMessage(content="You are a fitness RPG game announcer."), HumanMessage(content=prompt)]
                ai_text = f"AI Analysis: {chat_service.llm.invoke(msg).content.strip().replace('\"', '')}"
                report_data["summary"]["ai_insight"] = ai_text
                result["ai_insight"] = ai_text # Expose to frontend immediately
            except Exception:
                pass

            session_row = models.WorkoutSession(
                date=session_date,
                exercise=label,
                reps_actual=reps,
                form_score=float(avg_conf * 100),
                mean_power=avg_power,
                json_report=json.dumps(report_data),
                user_id=user_id
            )
            db.add(session_row)
        
        db.commit()
        
        # Achievement logic (skip for admins)
        new_badges = []
        if not current_user.is_admin:
            from sqlalchemy import func
            for ex in result.get("exercise_breakdown", []):
                # ... [existing achievement logic] ...
                label = ex.get("label")
                reps = ex.get("rep_count", 0)
                avg_conf = result.get("confidence", 0) * 100
                
                total_ever = db.query(func.sum(models.WorkoutSession.reps_actual)).filter(models.WorkoutSession.exercise == label, models.WorkoutSession.user_id == user_id).scalar() or 0
                
                # Badge 1: 500 Club
                if total_ever >= 500:
                    badge = f"500 {label.capitalize()} Reps Club"
                    exists = db.query(models.Achievement).filter(models.Achievement.badge_name == badge, models.Achievement.user_id == user_id).first()
                    if not exists:
                        new_achive = models.Achievement(
                            badge_name=badge, 
                            description=f"You've smashed 500 total reps of {label}!", 
                            icon="star",
                            user_id=user_id
                        )
                        db.add(new_achive)
                        new_badges.append(badge)
                
                # Badge 2: Volume King (100+ reps in one session)
                if reps >= 100:
                    badge = f"{label.capitalize()} Volume King"
                    exists = db.query(models.Achievement).filter(models.Achievement.badge_name == badge, models.Achievement.user_id == user_id).first()
                    if not exists:
                        new_achive = models.Achievement(
                            badge_name=badge, 
                            description=f"Over 100 reps of {label} in a single session! Unstoppable.", 
                            icon="flame",
                            user_id=user_id
                        )
                        db.add(new_achive)
                        new_badges.append(badge)

                # Badge 3: Set Sniper (Form >= 95%)
                if avg_conf >= 95.0 and reps >= 10:
                    badge = f"{label.capitalize()} Set Sniper"
                    exists = db.query(models.Achievement).filter(models.Achievement.badge_name == badge, models.Achievement.user_id == user_id).first()
                    if not exists:
                        new_achive = models.Achievement(
                            badge_name=badge, 
                            description=f"Near perfect form on {label} for a full set. Flawless execution.", 
                            icon="target",
                            user_id=user_id
                        )
                        db.add(new_achive)
                        new_badges.append(badge)
                
                # Badge 4: New Ground (First time)
                session_count = db.query(models.WorkoutSession).filter(models.WorkoutSession.exercise == label, models.WorkoutSession.user_id == user_id).count()
                if session_count == 1: # Only the one we just inserted
                    badge = f"New Ground: {label.capitalize()}"
                    exists = db.query(models.Achievement).filter(models.Achievement.badge_name == badge, models.Achievement.user_id == user_id).first()
                    if not exists:
                        new_achive = models.Achievement(
                            badge_name=badge, 
                            description=f"Welcome to {label}. The journey of a thousand reps begins here.", 
                            icon="pulse",
                            user_id=user_id
                        )
                        db.add(new_achive)
                        new_badges.append(badge)
            
            db.commit()
        
        result["new_achievements"] = new_badges

        # --- XP LOGIC (skip for admins) ---
        user = db.query(models.User).filter(models.User.id == user_id).first()
        leveled_up = False
        if user and not user.is_admin:
            gained_xp = 0
            for ex in result.get("exercise_breakdown", []):
                reps = ex.get("rep_count", 0)
                gained_xp += reps * 10
            
            # Form bonus from overall confidence
            overall_form = result.get("confidence", 0) * 100
            if overall_form > 80.0:
                gained_xp += int((overall_form - 80.0) * 5)
            
            user.xp += gained_xp
            xp_needed = user.level * 1000
            
            while user.xp >= xp_needed:
                user.xp -= xp_needed
                user.level += 1
                leveled_up = True
                xp_needed = user.level * 1000

            db.commit()
            result["new_xp_total"] = user.xp
            result["leveled_up"] = leveled_up
        elif user and user.is_admin:
            result["new_xp_total"] = 0
            result["leveled_up"] = False

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
