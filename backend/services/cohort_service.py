"""
cohort_service.py
------------------
Manages direct community average benchmarking. Seeds named community athletes
and aggregates all comparative statistics dynamically from database records.
Calculates dynamic fitness grades and relative performance deltas.
"""

import os
import json
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from backend.database import models

# Seeded community handles and profiles representing our active community base
COMMUNITY_ATHLETES = {
    "iron_warrior": {"name": "Iron Warrior", "specialty": "Volume Heavyweight", "bio": "A seasoned lifter specializing in high volume density and explosive concentric acceleration.", "badge": "Volume King", "power": 1.25, "wobble": 5.8, "reps": 12, "form": 92.0},
    "form_master": {"name": "Form Master", "specialty": "Form Purist", "bio": "Focuses on clean form execution and absolute joint control, displaying the lowest rotational wobble.", "badge": "Form Sniper", "power": 0.85, "wobble": 3.6, "reps": 10, "form": 97.0},
    "velocity_pro": {"name": "Velocity Pro", "specialty": "Speed Demon", "bio": "Exhibits highly rapid concentric phases and exceptional muscular explosive power.", "badge": "Explosive Zap", "power": 1.45, "wobble": 9.5, "reps": 8, "form": 90.0},
    "tempo_king": {"name": "Tempo King", "specialty": "Pacing Specialist", "bio": "Maintains highly uniform set timings and incredibly consistent cadence between reps.", "badge": "Set Sniper", "power": 0.75, "wobble": 4.2, "reps": 10, "form": 94.0},
    "balanced_fit": {"name": "Balanced Fit", "specialty": "Balanced Athlete", "bio": "Displays a balanced ratio of concentric velocity, movement quality, and stability.", "badge": "Master Elite", "power": 1.05, "wobble": 4.3, "reps": 10, "form": 93.0}
}

EXERCISE_KEYS = ['bench', 'squat', 'ohp', 'dead', 'row']
EXERCISE_NAMES_MAP = {
    "bench": "Bench Press",
    "squat": "Squat",
    "ohp": "OHP",
    "dead": "Deadlift",
    "row": "Row"
}

def seed_cohort_data(db: Session) -> None:
    """
    Seeds named community athletes into the database if they do not exist yet.
    Also cleans up old 'athlete_a' placeholders if present to keep the DB pristine.
    """
    # 1. Clean up old placeholders
    old_usernames = ["athlete_a", "athlete_b", "athlete_c", "athlete_d", "athlete_e"]
    for old_user in old_usernames:
        user = db.query(models.User).filter(models.User.username == old_user).first()
        if user:
            db.query(models.WorkoutSession).filter(models.WorkoutSession.user_id == user.id).delete()
            db.delete(user)
    db.commit()

    # 2. Seed realistic fitness users (Baseline historical records)
    today = date.today()
    for username, profile in COMMUNITY_ATHLETES.items():
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            user = models.User(
                username=username,
                email=f"{username}@evofit.ai",
                password_hash="seeded_community_athlete_hash",
                level=15,
                xp=8500,
                is_admin=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Seed sets history
            for ex in EXERCISE_KEYS:
                for day_offset in [2, 4, 6]:
                    session_date = today - timedelta(days=day_offset)
                    
                    ex_var = (hash(username + ex + str(day_offset)) % 7) - 3
                    set_reps = max(5, int(profile["reps"] + (ex_var // 2)))
                    set_form = max(60.0, min(100.0, profile["form"] + ex_var))
                    set_power = max(0.4, min(3.0, profile["power"] + (ex_var * 0.05)))
                    
                    report_data = {
                        "rep_details": [
                            {"rep": i + 1, "score": set_form - (i * 0.5), "rhythm": 90 + ex_var, "velocity": set_power}
                            for i in range(set_reps)
                        ]
                    }
                    
                    session_row = models.WorkoutSession(
                        user_id=user.id,
                        date=session_date,
                        exercise=EXERCISE_NAMES_MAP[ex],
                        reps_actual=set_reps,
                        form_score=set_form,
                        mean_power=set_power,
                        duration_sec=float(set_reps * 2),
                        json_report=json.dumps(report_data)
                    )
                    db.add(session_row)
            
            db.commit()

    # 3. Simulate active daily workouts for community athletes to keep the platform alive!
    for username, profile in COMMUNITY_ATHLETES.items():
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            # Check if they have a session logged today
            today_session = db.query(models.WorkoutSession).filter(
                models.WorkoutSession.user_id == user.id,
                models.WorkoutSession.date == today
            ).first()
            
            if not today_session:
                # 45% chance they completed a workout today
                seed_val = int(today.strftime("%Y%m%d")) + hash(username)
                random.seed(seed_val)
                if random.random() < 0.45:
                    active_ex = random.choice(EXERCISE_KEYS)
                    ex_var = random.randint(-3, 3)
                    set_reps = max(5, int(profile["reps"] + (ex_var // 2)))
                    set_form = max(60.0, min(100.0, profile["form"] + ex_var))
                    set_power = max(0.4, min(3.0, profile["power"] + (ex_var * 0.05)))
                    
                    report_data = {
                        "rep_details": [
                            {"rep": i + 1, "score": set_form - (i * 0.5), "rhythm": 90 + ex_var, "velocity": set_power}
                            for i in range(set_reps)
                        ]
                    }
                    
                    session_row = models.WorkoutSession(
                        user_id=user.id,
                        date=today,
                        exercise=EXERCISE_NAMES_MAP[active_ex],
                        reps_actual=set_reps,
                        form_score=set_form,
                        mean_power=set_power,
                        duration_sec=float(set_reps * 2),
                        json_report=json.dumps(report_data)
                    )
                    db.add(session_row)
            db.commit()


def calculate_user_ex_metrics(sessions: List[models.WorkoutSession]) -> Dict[str, Any]:
    """Calculates average metrics from DB sessions."""
    if not sessions:
        return {"has_data": False}
        
    avg_form = sum(s.form_score for s in sessions) / len(sessions)
    avg_power_raw = sum(s.mean_power or 0.0 for s in sessions) / len(sessions)
    total_reps = sum(s.reps_actual or 0 for s in sessions)
    avg_reps_per_set = total_reps / len(sessions)
    
    normalized_power = round(65.0 + min(30.0, avg_power_raw * 15.0), 1)
    stability = round(avg_form * 0.96, 1)
    consistency = round(avg_form * 0.94, 1)
    
    return {
        "has_data": True,
        "power": max(45.0, min(100.0, normalized_power)),
        "stability": max(45.0, min(100.0, stability)),
        "consistency": max(45.0, min(100.0, consistency)),
        "volume": round(avg_reps_per_set, 1),
        "form": round(avg_form, 1)
    }


def calculate_fitness_grade(user_score: float, community_avg: float) -> Dict[str, str]:
    """Grades user metrics using descriptive tiers instead of letters. No device or hardware references."""
    delta = user_score - community_avg
    if delta >= 8.0:
        return {
            "grade": "Elite Tier",
            "color": "#7C3AED",
            "description": "Outperforming the community average by a substantial margin. Masterful execution."
        }
    elif delta >= 3.0:
        return {
            "grade": "Titan Master",
            "color": "#3B82F6",
            "description": "Exhibits great control and speed, outlasting the general fitness population."
        }
    elif delta >= -3.0:
        return {
            "grade": "Proficient",
            "color": "#10B981",
            "description": "Performing consistently within standard community average benchmarks."
        }
    elif delta >= -8.0:
        return {
            "grade": "Needs Focus",
            "color": "#F59E0B",
            "description": "Slightly below the community average. Focus on standardized movement drills to raise scores."
        }
    else:
        return {
            "grade": "Correction Needed",
            "color": "#EF4444",
            "description": "Significant variance detected. Review form details to stabilize speed and posture."
        }


def get_dynamic_cohort_stats(db: Session, active_user_id: int) -> Dict[str, Any]:
    """
    Queries all OTHER users in the system to calculate dynamic community averages
    and scores the active user accordingly with relative grading indices.
    """
    # 1. Ensure seed data
    seed_cohort_data(db)
    
    # 2. Fetch active user
    active_user = db.query(models.User).filter(models.User.id == active_user_id).first()
    active_username = active_user.username if active_user else "athlete"
    
    # 3. Calculate active user's stats across all 5 exercises (ACTUAL DATA ONLY)
    user_stats = {}
    for ex in EXERCISE_KEYS:
        ex_name = EXERCISE_NAMES_MAP[ex]
        sessions = db.query(models.WorkoutSession).filter(
            models.WorkoutSession.user_id == active_user_id,
            func.lower(models.WorkoutSession.exercise) == ex_name.lower()
        ).all()
        
        user_stats[ex] = calculate_user_ex_metrics(sessions)

    # 4. Fetch all OTHER non-admin users in the system to compute the Community Averages
    other_users = db.query(models.User).filter(
        models.User.is_admin == False,
        models.User.id != active_user_id
    ).all()
    
    # Calculate profiles for all other community members
    other_profiles = {}
    metadata_directory = {}
    
    for u in other_users:
        other_profiles[u.username] = {}
        for ex in EXERCISE_KEYS:
            ex_name = EXERCISE_NAMES_MAP[ex]
            sessions = db.query(models.WorkoutSession).filter(
                models.WorkoutSession.user_id == u.id,
                func.lower(models.WorkoutSession.exercise) == ex_name.lower()
            ).all()
            
            metrics = calculate_user_ex_metrics(sessions)
            if not metrics.get("has_data", False):
                metrics = {
                    "has_data": False,
                    "power": 75.0,
                    "stability": 84.0,
                    "consistency": 86.0,
                    "volume": 10.0,
                    "form": 88.0
                }
            other_profiles[u.username][ex] = metrics
            
        # Compile metadata bios
        if u.username in COMMUNITY_ATHLETES:
            metadata_directory[u.username] = {
                "name": COMMUNITY_ATHLETES[u.username]["name"],
                "specialty": COMMUNITY_ATHLETES[u.username]["specialty"],
                "bio": COMMUNITY_ATHLETES[u.username]["bio"],
                "badge": COMMUNITY_ATHLETES[u.username]["badge"]
            }
        else:
            metadata_directory[u.username] = {
                "name": u.username.replace("_", " ").title(),
                "specialty": "Active Challenger",
                "bio": f"An active athlete in the EvoFit community logging real-time workouts at Level {u.level}.",
                "badge": "Community Star"
            }

    # 5. Compute dynamic Community Averages across all other users
    community_avg = {}
    for ex in EXERCISE_KEYS:
        valid_powers = [other_profiles[u][ex]["power"] for u in other_profiles]
        valid_stabs = [other_profiles[u][ex]["stability"] for u in other_profiles]
        valid_cons = [other_profiles[u][ex]["consistency"] for u in other_profiles]
        valid_vols = [other_profiles[u][ex]["volume"] for u in other_profiles]
        valid_forms = [other_profiles[u][ex]["form"] for u in other_profiles]
        
        community_avg[ex] = {
            "power": round(sum(valid_powers) / len(valid_powers), 1) if valid_powers else 78.0,
            "stability": round(sum(valid_stabs) / len(valid_stabs), 1) if valid_stabs else 85.0,
            "consistency": round(sum(valid_cons) / len(valid_cons), 1) if valid_cons else 88.0,
            "volume": round(sum(valid_vols) / len(valid_vols), 1) if valid_vols else 10.0,
            "form": round(sum(valid_forms) / len(valid_forms), 1) if valid_forms else 90.0
        }

    # 6. Dynamically grade the active user relative to the Community Average (if actual data is present)
    scoring_matrix = {}
    for ex in EXERCISE_KEYS:
        u_ex = user_stats[ex]
        c_ex = community_avg[ex]
        
        if not u_ex.get("has_data", False):
            scoring_matrix[ex] = {}
            continue
            
        scoring_matrix[ex] = {
            "power": {
                "user_score": u_ex["power"],
                "community_score": c_ex["power"],
                "delta": round(u_ex["power"] - c_ex["power"], 1),
                "grade_info": calculate_fitness_grade(u_ex["power"], c_ex["power"])
            },
            "stability": {
                "user_score": u_ex["stability"],
                "community_score": c_ex["stability"],
                "delta": round(u_ex["stability"] - c_ex["stability"], 1),
                "grade_info": calculate_fitness_grade(u_ex["stability"], c_ex["stability"])
            },
            "consistency": {
                "user_score": u_ex["consistency"],
                "community_score": c_ex["consistency"],
                "delta": round(u_ex["consistency"] - c_ex["consistency"], 1),
                "grade_info": calculate_fitness_grade(u_ex["consistency"], c_ex["consistency"])
            },
            "volume": {
                "user_score": u_ex["volume"],
                "community_score": c_ex["volume"],
                "delta": round(u_ex["volume"] - c_ex["volume"], 1),
                "grade_info": calculate_fitness_grade(u_ex["volume"] * 5.0, c_ex["volume"] * 5.0)
            },
            "form": {
                "user_score": u_ex["form"],
                "community_score": c_ex["form"],
                "delta": round(u_ex["form"] - c_ex["form"], 1),
                "grade_info": calculate_fitness_grade(u_ex["form"], c_ex["form"])
            }
        }

    return {
        "user_stats": user_stats,
        "community_avg": community_avg,
        "scoring_matrix": scoring_matrix,
        "other_profiles": other_profiles,
        "metadata": metadata_directory,
        "username": active_username
    }
