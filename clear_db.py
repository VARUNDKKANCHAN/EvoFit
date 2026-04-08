import sqlite3
import os

DB_PATH = "backend/evofit.db"

def clear_user_data():
    if not os.path.exists(DB_PATH):
        print("Database not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    print("Wiping all data for User 1...")
    # Delete everything for the primary user
    c.execute("DELETE FROM workout_sessions WHERE user_id = 1")
    c.execute("DELETE FROM targets WHERE user_id = 1")
    c.execute("DELETE FROM achievements WHERE user_id = 1")

    conn.commit()
    conn.close()
    print("Dashboard Reset! You can now start fresh with actual workout data.")

if __name__ == "__main__":
    clear_user_data()
