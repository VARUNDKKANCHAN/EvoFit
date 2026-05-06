import sys
import os

# Ensure the root directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database.database import SessionLocal
from backend.database import models
from backend.services import auth_service

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if admin:
            print("[INFO] Admin user already exists. Updating password and privileges...")
            admin.password_hash = auth_service.get_password_hash("admin")
            admin.is_admin = True
            db.commit()
            print("[SUCCESS] Admin user updated. Username: admin, Password: admin")
        else:
            print("[INFO] Creating admin user...")
            hashed_pwd = auth_service.get_password_hash("admin")
            new_admin = models.User(
                username="admin",
                email="admin@evofit.com",
                password_hash=hashed_pwd,
                is_admin=True,
                level=99,
                xp=100000
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            
            # Create a profile for the admin as well
            new_profile = models.UserProfile(
                user_id=new_admin.id,
                full_name="Platform Admin",
                age=30,
                gender="Other",
                fitness_goal="Maintain System"
            )
            db.add(new_profile)
            db.commit()
            print("[SUCCESS] Admin user created. Username: admin, Password: admin")
    except Exception as e:
        print(f"[ERROR] Failed to create admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
