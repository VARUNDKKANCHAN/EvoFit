import sys
import os
sys.path.insert(0, "d:/EvoFit")

from backend.database.database import SessionLocal
from backend.database import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print("=== REGISTERED USERS IN DB ===")
    for u in users:
        sessions_count = db.query(models.WorkoutSession).filter(models.WorkoutSession.user_id == u.id).count()
        print(f"ID: {u.id} | Username: {u.username} | Email: {u.email} | Admin: {u.is_admin} | Sessions: {sessions_count}")
finally:
    db.close()
