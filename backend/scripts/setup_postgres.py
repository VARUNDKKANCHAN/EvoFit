import sys
import os
# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.database.database import engine, SQLALCHEMY_DATABASE_URL
from backend.database import models
import sqlalchemy

def verify_connection():
    print(f"[*] Attempting to connect to: {SQLALCHEMY_DATABASE_URL}")
    try:
        # Try to connect
        with engine.connect() as connection:
            print("[+] Connection successful!")
            
            # Create tables
            print("[*] Creating tables...")
            models.Base.metadata.create_all(bind=engine)
            print("[+] Tables created successfully!")
            
    except Exception as e:
        print(f"[-] Connection failed: {e}")
        print("\n[!] TIP: Make sure your password in the .env file is correct.")
        print("[!] TIP: Make sure PostgreSQL is running on port 5432.")

if __name__ == "__main__":
    verify_connection()
