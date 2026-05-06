import sqlite3
import bcrypt
import os

DB_PATH = "backend/evofit.db"

def check_users():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, username, email, is_admin, password_hash FROM users")
    users = c.fetchall()
    
    print(f"{'ID':<5} {'Username':<15} {'Email':<20} {'Admin':<10} {'Password Hash'}")
    print("-" * 80)
    for u in users:
        print(f"{u[0]:<5} {u[1]:<15} {u[2]:<20} {u[3]:<10} {u[4]}")
        
        # Test password "admin" for user "admin"
        if u[1] == "admin":
            plain = "admin"
            hashed = u[4]
            if isinstance(hashed, str):
                hashed_bytes = hashed.encode('utf-8')
            else:
                hashed_bytes = hashed
            
            try:
                match = bcrypt.checkpw(plain.encode('utf-8'), hashed_bytes)
                print(f"  [TEST] Password 'admin' matches? {match}")
            except Exception as e:
                print(f"  [TEST] Error checking password: {e}")

    conn.close()

if __name__ == "__main__":
    check_users()
