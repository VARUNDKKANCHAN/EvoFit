import os
import sys
from datetime import date, timedelta

# Ensure the root directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database.database import SessionLocal, engine
from backend.database import models
from backend.services import auth_service

def test_database_direct():
    print("\n" + "="*60)
    print("DIRECT DATABASE INTEGRATION TEST (ORM LEVEL)")
    print("="*50)

    db = SessionLocal()
    try:
        # 1. CREATE USER
        print("\n[1/4] Creating a new professional user...")
        hashed_pwd = auth_service.get_password_hash("test_pass_123")
        new_user = models.User(
            username="test_pro_user_v2",
            email="pro_user_v2@evofit.ai",
            password_hash=hashed_pwd
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"[PASS] User created with ID: {new_user.id}")

        # 2. INITIALIZE PROFILE
        print("\n[2/4] Initializing user profile stats...")
        new_profile = models.UserProfile(
            user_id=new_user.id,
            full_name="Direct Tester",
            age=30,
            weight_kg=85.0,
            height_cm=180.0,
            gender="male",
            fitness_goal="Hypertrophy"
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        print(f"[PASS] Profile linked to user {new_user.id}")

        # 3. ADD RELATIONAL TARGET
        print("\n[3/4] Adding a relational training target...")
        new_target = models.Target(
            user_id=new_user.id,
            exercise="bench",
            weekly_rep_target=300,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7)
        )
        db.add(new_target)
        db.commit()
        print(f"[PASS] Bench Press target (300 reps) linked via ForeignKey.")

        # 4. VERIFY DATA RETRIEVAL
        print("\n[4/4] Verifying data integrity through the User relationship...")
        retrieved_user = db.query(models.User).filter(models.User.id == new_user.id).first()
        
        print(f"       - Found Username: {retrieved_user.username}")
        print(f"       - Profile Goal:   {retrieved_user.profile.fitness_goal}")
        print(f"       - Target Count:   {len(retrieved_user.targets)}")
        
        if retrieved_user.profile.full_name == "Direct Tester" and len(retrieved_user.targets) == 1:
            print("\n[SUCCESS] DATA INTEGRITY VERIFIED!")
        else:
            print("\n[ERROR] DATA INTEGRITY ERROR.")

    except Exception as e:
        print(f"\n❌ TEST FAILED with error: {e}")
        db.rollback()
    finally:
        db.close()

    print("\n" + "="*60)

if __name__ == "__main__":
    test_database_direct()
