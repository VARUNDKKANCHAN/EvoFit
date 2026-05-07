from backend.database.database import SessionLocal
from backend.database import models

db = SessionLocal()
user = db.query(models.User).filter(models.User.username == "varun_pro").first()
if user:
    print(f"ID: {user.id}")
    print(f"Username: {user.username}")
    print(f"Is Admin (Raw): {user.is_admin}")
    print(f"Is Admin (Bool): {bool(user.is_admin)}")
    print(f"Level: {user.level}")
    print(f"XP: {user.xp}")
else:
    print("User not found")
db.close()
