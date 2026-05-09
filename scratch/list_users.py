import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env")
db_url = os.getenv("DATABASE_URL")

def list_users():
    print(f"[*] Connecting to: {db_url}")
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, username, email, is_admin FROM users"))
            print("\n[+] Registered Users:")
            for row in result:
                print(f"  ID: {row[0]} | Username: {row[1]} | Email: {row[2]} | Admin: {row[3]}")
                
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    list_users()
