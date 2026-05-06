
import sys
import os
import sqlite3

# Ensure the root directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database.database import SessionLocal
from backend.database import models
from backend.services import auth_service

def run_and_verify():
    output_file = "scratch/admin_creation_log.txt"
    with open(output_file, "w") as f:
        f.write("Starting admin creation...\n")
        db = SessionLocal()
        try:
            admin = db.query(models.User).filter(models.User.username == "admin").first()
            if admin:
                f.write("Admin user found. Updating...\n")
                admin.password_hash = auth_service.get_password_hash("admin")
                admin.is_admin = True
                db.commit()
                f.write("Admin user updated successfully.\n")
            else:
                f.write("Creating new admin user...\n")
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
                
                new_profile = models.UserProfile(
                    user_id=new_admin.id,
                    full_name="Platform Admin",
                    age=30,
                    gender="Other",
                    fitness_goal="Maintain System"
                )
                db.add(new_profile)
                db.commit()
                f.write("Admin user created successfully.\n")
            
            # Final check
            db.refresh(admin if admin else new_admin)
            check = db.query(models.User).filter(models.User.username == "admin").first()
            f.write(f"Verification: Username={check.username}, IsAdmin={check.is_admin}, Level={check.level}\n")
            
        except Exception as e:
            f.write(f"Error: {e}\n")
            db.rollback()
        finally:
            db.close()
        f.write("Done.\n")

if __name__ == "__main__":
    run_and_verify()
