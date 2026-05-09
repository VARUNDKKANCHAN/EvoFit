import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env")
db_url = os.getenv("DATABASE_URL")

def list_tables():
    print(f"[*] Connecting to: {db_url}")
    try:
        engine = create_engine(db_url)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n[+] Found {len(tables)} tables in 'public' schema:")
        for table in tables:
            # Count rows
            with engine.connect() as conn:
                from sqlalchemy import text
                count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                print(f"  - {table:20} ({count} rows)")
                
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    list_tables()
