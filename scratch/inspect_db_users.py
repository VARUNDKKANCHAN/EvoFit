import os
import sys

sys.path.insert(0, "d:/EvoFit")
from backend.database.database import SessionLocal
from backend.database import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print("Total users in DB:", len(users))
    for u in users:
        print(f"  - User ID: {u.id}, Username: {u.username}, Level: {u.level}, XP: {u.xp}, Admin: {u.is_admin}")
        
    sessions = db.query(models.WorkoutSession).all()
    print("Total workout sessions in DB:", len(sessions))
    # Check exercises
    exercises = db.query(models.WorkoutSession.exercise, models.WorkoutSession.user_id).all()
    print("Sessions list (sample):", exercises[:20])
finally:
    db.close()
