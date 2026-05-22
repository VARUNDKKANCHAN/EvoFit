import io
import json
import os
import sys
from datetime import date, timedelta
from unittest.mock import MagicMock

# Force SQLite during test runs to avoid loading psycopg2/postgres dependencies
os.environ["DATABASE_URL"] = "sqlite:///./test_evofit.db"


import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup system paths so we can import from backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.main import app
from backend.database.database import get_db, Base
from backend.database import models
from backend.services import auth_service
from backend.services.chat_service import chat_service

# --- ISOLATED TEST DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_evofit.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# --- MOCK CHAT AND LLM SERVICES ---
mock_llm_response = MagicMock()
mock_llm_response.content = "Announcer: Incredible effort! Keep smashing those goals!"
mock_llm_response.response_metadata = {"token_usage": {"total_tokens": 120}}
chat_service.llm = MagicMock()
chat_service.llm.invoke = MagicMock(return_value=mock_llm_response)


chat_service.vector_store = MagicMock()
mock_doc = MagicMock()
mock_doc.page_content = "Maintain a straight back when doing a squat."
chat_service.vector_store.similarity_search = MagicMock(return_value=[mock_doc])

# --- TEST FIXTURES ---
@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Clean database before tests
    if os.path.exists("./test_evofit.db"):
        os.remove("./test_evofit.db")
    
    Base.metadata.create_all(bind=engine)
    
    # Insert pre-defined admin and normal user
    db = TestingSessionLocal()
    
    # 1. Admin user
    admin_pwd = auth_service.get_password_hash("AdminPass_123")
    admin = models.User(
        username="evofit_admin",
        email="admin@evofit.ai",
        password_hash=admin_pwd,
        is_admin=True,
        is_active=True
    )
    db.add(admin)
    
    # 2. Normal user
    user_pwd = auth_service.get_password_hash("UserPass_123")
    user = models.User(
        username="evofit_user",
        email="user@evofit.ai",
        password_hash=user_pwd,
        is_admin=False,
        is_active=True
    )
    db.add(user)
    
    db.commit()
    db.close()
    
    yield
    
    # Cleanup after tests
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_evofit.db"):
        try:
            os.remove("./test_evofit.db")
        except PermissionError:
            pass

# --- AUTH & REGISTRATION TESTS ---

def test_register_password_strength_validation():
    client = TestClient(app)
    
    # Under 8 characters
    payload = {
        "username": "shorty", "email": "shorty@evofit.ai", "password": "Sh1!",
        "full_name": "Short Pass"
    }
    r = client.post("/users/register", json=payload)
    assert r.status_code == 400
    assert "at least 8 characters" in r.json()["detail"]

    # Missing uppercase
    payload["password"] = "no_upper_123!"
    r = client.post("/users/register", json=payload)
    assert r.status_code == 400
    assert "uppercase letter" in r.json()["detail"]

    # Missing lowercase
    payload["password"] = "NO_LOWER_123!"
    r = client.post("/users/register", json=payload)
    assert r.status_code == 400
    assert "lowercase letter" in r.json()["detail"]

    # Missing number
    payload["password"] = "NoNumberHere!"
    r = client.post("/users/register", json=payload)
    assert r.status_code == 400
    assert "at least one number" in r.json()["detail"]

    # Missing special character
    payload["password"] = "NoSpecialChar123"
    r = client.post("/users/register", json=payload)
    assert r.status_code == 400
    assert "special character" in r.json()["detail"]

def test_register_success_and_duplicates():
    client = TestClient(app)
    
    payload = {
        "username": "new_fitness_guy",
        "email": "guy@evofit.ai",
        "password": "SecurePassword_123!",
        "full_name": "Guy Smiley",
        "age": 25,
        "weight_kg": 80.0,
        "height_cm": 180.0,
        "gender": "male",
        "fitness_goal": "Strength"
    }
    
    r = client.post("/users/register", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["username"] == "new_fitness_guy"
    assert data["email"] == "guy@evofit.ai"
    assert data["is_admin"] is False
    assert data["is_active"] is True
    
    # Try duplicate registration
    r2 = client.post("/users/register", json=payload)
    assert r2.status_code == 400
    assert "already registered" in r2.json()["detail"]

def test_login_validation_and_tokens():
    client = TestClient(app)
    
    # Incorrect credentials
    login_payload = {"username": "evofit_user", "password": "WrongPassword123"}
    r = client.post("/users/login", json=login_payload)
    assert r.status_code == 401
    assert "Invalid username or password" in r.json()["detail"]
    
    # Successful login
    login_payload["password"] = "UserPass_123"
    r = client.post("/users/login", json=login_payload)
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

# --- USER PROFILE & ME ENDPOINTS ---

def test_user_me_and_profile_updates():
    client = TestClient(app)
    
    # Login to get token
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get Me info
    me_r = client.get("/users/me", headers=headers)
    assert me_r.status_code == 200
    me_data = me_r.json()
    assert me_data["username"] == "evofit_user"
    assert me_data["is_admin"] is False
    
    # Update profile
    profile_payload = {
        "full_name": "Evo User Updated",
        "age": 29,
        "weight_kg": 82.5,
        "height_cm": 178.5,
        "gender": "male",
        "fitness_goal": "Hypertrophy"
    }
    update_r = client.put("/users/me/profile", headers=headers, json=profile_payload)
    assert update_r.status_code == 200
    updated_data = update_r.json()
    assert updated_data["full_name"] == "Evo User Updated"
    assert updated_data["age"] == 29
    assert updated_data["weight_kg"] == 82.5
    
    # Get Profile endpoint
    profile_r = client.get("/users/me/profile", headers=headers)
    assert profile_r.status_code == 200
    assert profile_r.json()["full_name"] == "Evo User Updated"

# --- TARGETS & PROGRESS TESTS ---

def test_targets_crud_and_progress():
    client = TestClient(app)
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Verify no targets originally
    get_r = client.get("/targets/", headers=headers)
    assert get_r.status_code == 200
    assert len(get_r.json()) == 0
    
    # Create target
    target_payload = {
        "exercise": "squat",
        "weekly_rep_target": 200
    }
    post_r = client.post("/targets/", headers=headers, json=target_payload)
    assert post_r.status_code == 200
    target_data = post_r.json()
    assert target_data["exercise"] == "squat"
    assert target_data["weekly_rep_target"] == 200
    
    # Verify target fetched
    get_r2 = client.get("/targets/", headers=headers)
    assert len(get_r2.json()) == 1
    
    # Check overall progress
    progress_r = client.get("/targets/progress", headers=headers)
    assert progress_r.status_code == 200
    progress_data = progress_r.json()
    assert "exercise_progress" in progress_data
    # Look for squat target
    squat_progress = [p for p in progress_data["exercise_progress"] if p["exercise"] == "squat"][0]
    assert squat_progress["target_reps"] == 200

# --- ML PREDICTION ENGINE TESTS ---

def test_predict_invalid_extensions():
    client = TestClient(app)
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try invalid JSON format upload
    files = {"file": ("data.json", b'{"data": 1}', "application/json")}
    r = client.post("/predict/", headers=headers, files=files)
    assert r.status_code == 400
    assert "Unsupported file type" in r.json()["detail"]

def test_predict_real_data_flow():
    client = TestClient(app)
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Read part of the interim dataset
    df = pd.read_pickle("data/interim/01_data_processed.pkl")
    sub = df[df["label"] == "squat"].copy()
    s1 = sub[sub["set"] == sub["set"].iloc[0]].copy()
    
    buf = io.BytesIO()
    s1.to_csv(buf)
    buf.seek(0)
    
    # Upload CSV file to predictions
    files = {"file": ("squat.csv", buf, "text/csv")}
    r = client.post("/predict/", headers=headers, files=files)
    
    assert r.status_code == 200
    data = r.json()
    assert "predicted_label" in data
    assert data["predicted_label"] == "squat"
    assert "rep_count" in data
    assert data["rep_count"] > 0
    assert "confidence" in data
    
    # Validate that XP is added and user progression is affected
    me_r = client.get("/users/me", headers=headers)
    assert me_r.json()["xp"] > 0

def test_predict_metrics():
    client = TestClient(app)
    r = client.get("/predict/metrics")
    assert r.status_code == 200
    data = r.json()
    assert "accuracy" in data
    assert "confusion_matrix" in data
    assert "classes" in data

# --- LEADERBOARD & COHORT TESTS ---

def test_leaderboard_logic():
    client = TestClient(app)
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Fetch Leaderboard
    r = client.get("/users/leaderboard?timeframe=All-time", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert "leaderboard" in data
    assert "percentile" in data
    
    # Exclude admins verify
    leaderboard_usernames = [u["username"] for u in data["leaderboard"]]
    assert "evofit_admin" not in leaderboard_usernames

def test_cohort_comparison():
    client = TestClient(app)
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    r = client.get("/cohort/comparison", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert "user_stats" in data
    assert "community_avg" in data
    assert "coaching_insights" in data

# --- RAG AI CHAT TESTS ---

def test_ai_chat_mocked():
    client = TestClient(app)
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {"query": "How do I make sure my squat form is correct?"}
    r = client.post("/chat/", headers=headers, json=payload)
    
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert "mocked RAG coach response" in data.get("response") or "Announcer" in data.get("response")
    
    # Check that tokens are logged to user's profile
    me_r = client.get("/users/me", headers=headers)
    assert me_r.json()["rag_tokens_total"] > 0

# --- ADMIN PANEL & SECURITY ENDPOINTS (RBAC) ---

def test_admin_access_controls():
    client = TestClient(app)
    
    # Normal user trying to access admin stats should be rejected with 403
    login_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    r = client.get("/admin/stats", headers=headers)
    assert r.status_code == 403
    assert "Administrative privileges required" in r.json()["detail"]

def test_admin_operations_flow():
    client = TestClient(app)
    
    # Login as admin
    login_r = client.post("/users/login", json={"username": "evofit_admin", "password": "AdminPass_123"})
    token = login_r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Fetch Admin Stats
    stats_r = client.get("/admin/stats", headers=headers)
    assert stats_r.status_code == 200
    stats_data = stats_r.json()
    assert "total_users" in stats_data
    assert "avg_form_score" in stats_data
    
    # List users
    users_r = client.get("/admin/users", headers=headers)
    assert users_r.status_code == 200
    users_list = users_r.json()
    assert len(users_list) >= 2
    
    # Find normal user's ID
    user_id = [u["id"] for u in users_list if u["username"] == "evofit_user"][0]
    
    # Modify User Token Limit
    limit_r = client.put(f"/admin/users/{user_id}/token-limit?limit=75000", headers=headers)
    assert limit_r.status_code == 200
    assert limit_r.json()["rag_token_limit"] == 75000
    
    # Deactivate normal user account
    deactivate_r = client.put(f"/admin/users/{user_id}/status?is_active=false", headers=headers)
    assert deactivate_r.status_code == 200
    
    # Assert that deactivated user login fails with 403
    login_failed_r = client.post("/users/login", json={"username": "evofit_user", "password": "UserPass_123"})
    assert login_failed_r.status_code == 403
    assert "Account is deactivated" in login_failed_r.json()["detail"]
    
    # Reactivate the user account
    reactivate_r = client.put(f"/admin/users/{user_id}/status?is_active=true", headers=headers)
    assert reactivate_r.status_code == 200
    
    # Assert system status health
    sys_r = client.get("/admin/system-status", headers=headers)
    assert sys_r.status_code == 200
    assert sys_r.json()["database"] == "operational"
    
    # Flush Cache / Reset Metrics
    flush_r = client.post("/admin/system/flush-cache", headers=headers)
    assert flush_r.status_code == 200
    
    # Verify Audit Logs
    audit_r = client.get("/admin/audit-logs", headers=headers)
    assert audit_r.status_code == 200
    actions = [a["action"] for a in audit_r.json()]
    assert "UPDATE_TOKEN_LIMIT" in actions
    assert "DEACTIVATE_USER" in actions
    assert "FLUSH_CACHE" in actions
