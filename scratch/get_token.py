from backend.services.auth_service import create_access_token
from backend.database.database import SessionLocal
from backend.database import models

db = SessionLocal()
user = db.query(models.User).filter(models.User.username == "varun_pro").first()
if user:
    token = create_access_token(data={"sub": user.username})
    print(token)
else:
    print("User not found")
db.close()
