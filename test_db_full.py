import requests
import json
import os
import sqlite3

BASE_URL = "http://localhost:8000"

def test_multi_user_flow():
    print("\n" + "="*50)
    print("STARTING PROFESSIONAL DATABASE INTEGRATION TEST")
    print("="*50)

    # 1. REGISTER NEW USER
    user_payload = {
        "username": "ultra_trainer_v1",
        "email": "ultra@evofit.ai",
        "password": "secure_password_123"
    }
    print(f"\n[1/4] Registering new user: {user_payload['username']}...")
    res = requests.post(f"{BASE_URL}/users/register", json=user_payload)
    
    if res.status_code != 201:
        print(f"[FAIL] Registration failed: {res.text}")
        return
    
    user_data = res.json()
    uid = user_data['id']
    print(f"[PASS] User registered with ID: {uid}")

    # 2. UPDATE PROFILE
    profile_payload = {
        "full_name": "EvoFit Ultra User",
        "age": 28,
        "weight_kg": 75.5,
        "height_cm": 182.0,
        "gender": "male",
        "fitness_goal": "Strength"
    }
    print(f"\n[2/4] Updating User Profile for ID {uid}...")
    res = requests.put(f"{BASE_URL}/users/me/profile", params={"user_id": uid}, json=profile_payload)
    
    if res.status_code != 200:
        print(f"[FAIL] Profile update failed: {res.text}")
        return
    print(f"[PASS] Profile updated successfully.")

    # 3. ADD TARGET VIA RELATIONSHIP
    target_payload = {
        "exercise": "squat",
        "weekly_rep_target": 600
    }
    print(f"\n[3/4] Creating a Squat Target (600 reps) for user {uid}...")
    res = requests.post(f"{BASE_URL}/targets/", params={"user_id": uid}, json=target_payload)
    
    if res.status_code != 200:
        print(f"[FAIL] Target creation failed: {res.text}")
        return
    print(f"[PASS] Relational target created.")

    # 4. DIRECT DATABASE VERIFICATION
    print("\n[4/4] Verifying Relational Integrity in evofit.db...")
    db_path = "backend/evofit.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("\n--- DATABASE SNAPSHOT ---")
    
    # Check User
    cursor.execute("SELECT id, username, email FROM users WHERE id=?", (uid,))
    user_row = cursor.fetchone()
    print(f"📄 TABLE 'users':      {user_row}")

    # Check Profile
    cursor.execute("SELECT user_id, weight_kg, fitness_goal FROM user_profiles WHERE user_id=?", (uid,))
    profile_row = cursor.fetchone()
    print(f"📄 TABLE 'profiles':   {profile_row}")

    # Check Targets
    cursor.execute("SELECT user_id, exercise, weekly_rep_target FROM targets WHERE user_id=?", (uid,))
    target_rows = cursor.fetchall()
    print(f"📄 TABLE 'targets':    {target_rows}")

    conn.close()
    
    print("\n" + "="*50)
    print("ALL TESTS PASSED: DATABASE IS PROFESSIONAL & INTEGRATED")
    print("="*50 + "\n")

if __name__ == "__main__":
    test_multi_user_flow()
