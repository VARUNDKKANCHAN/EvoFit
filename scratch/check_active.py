import sqlite3
import os

DB_PATH = "backend/evofit.db"

def check_active():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, username, is_active, is_admin FROM users WHERE username='admin'")
    row = c.fetchone()
    print(f"Admin User Info: {row}")
    conn.close()

if __name__ == "__main__":
    check_active()
