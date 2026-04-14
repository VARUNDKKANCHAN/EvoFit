import sqlite3
from datetime import date, timedelta
import random

DB_PATH = "backend/evofit.db"

def seed():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Clear existing demo data to ensure "consistency"
    print("Clearing old data for User 1...")
    c.execute("DELETE FROM workout_sessions WHERE user_id = 1")
    c.execute("DELETE FROM targets WHERE user_id = 1")
    c.execute("DELETE FROM achievements WHERE user_id = 1")
    
    # Ensure User 1 exists and set some XP
    c.execute("INSERT OR IGNORE INTO users (id, username, email, password_hash, xp, level) VALUES (1, 'alex_j', 'alex@example.com', 'hash', 4500, 5)")
    c.execute("UPDATE users SET xp = 4500, level = 5 WHERE id = 1")

    exercises = ["bench", "dead", "squat", "ohp", "row", "pullups"]
    today = date.today()

    print("Seeding targets for last 5 weeks...")
    # Seed targets for the last 5 weeks
    for i in range(5):
        start = today - timedelta(days=today.weekday() + (i * 7)) # Start of week
        end = start + timedelta(days=6)
        for ex in exercises:
            target_reps = random.choice([200, 250, 300])
            c.execute("""
                INSERT INTO targets (exercise, weekly_rep_target, start_date, end_date, user_id, created_at)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (ex, target_reps, start, end, start))

    print("Seeding workout sessions for last 30 days...")
    # Seed sessions (Train 4-5 days a week)
    for i in range(30, -1, -1):
        # Skip some days to look like a real human (e.g., skip weekends mostly)
        current_date = today - timedelta(days=i)
        if current_date.weekday() >= 5 and random.random() > 0.2:
            continue
        
        # Train 2nd-3rd exercise per day
        daily_exercises = random.sample(exercises, random.randint(2, 3))
        
        for ex in daily_exercises:
            reps = random.randint(30, 60) # roughly 3-5 sets
            form = random.uniform(88.0, 96.0)
            duration = random.randint(120, 300)
            power = random.uniform(200.0, 400.0)
            c.execute("""
                INSERT INTO workout_sessions (date, exercise, reps_actual, form_score, user_id, duration_sec, mean_power)
                VALUES (?, ?, ?, ?, 1, ?, ?)
            """, (current_date, ex, reps, form, duration, power))

    conn.commit()
    conn.close()
    print("Consistency Seeding Complete! User 1 now has a full 30-day history.")

if __name__ == "__main__":
    seed()
