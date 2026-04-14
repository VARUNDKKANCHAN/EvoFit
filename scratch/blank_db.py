import os
import sys

# Ensure the root directory is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.database import engine, Base, DB_PATH
import backend.database.models as models
from sqlalchemy.orm import Session

def reset_and_init():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as session:
        # Create empty base user
        new_user = models.User(
            id=1,
            username="alex_j",
            email="alex@example.com",
            password_hash="hash",
            xp=0,
            level=1
        )
        session.add(new_user)
        session.commit()
    print("Database completely empty, but initialized with blank User 1.")

if __name__ == "__main__":
    reset_and_init()
