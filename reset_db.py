import os
import sys

# Ensure the root directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database.database import engine, Base, DB_PATH
import backend.database.models as models

def reset_database():
    """Wipe the existing database and re-create the multi-user schema."""
    print(f"[INFO] Locating database at: {DB_PATH}")
    
    if os.path.exists(DB_PATH):
        print("[INFO] Database found. Deleting for clean reset...")
        try:
            os.remove(DB_PATH)
            print("[SUCCESS] Database file deleted successfully.")
        except Exception as e:
            print(f"[ERROR] Error deleting database: {e}")
            return
    else:
        print("[INFO] No existing database found. Starting fresh.")

    print("[INFO] Creating all tables based on the new schema...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] Tables created successfully:")
        for table_name in Base.metadata.tables.keys():
            print(f"    - {table_name}")
    except Exception as e:
        print(f"[ERROR] Error creating tables: {e}")

if __name__ == "__main__":
    reset_database()
