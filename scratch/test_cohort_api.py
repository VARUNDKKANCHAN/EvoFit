import sys
import os

sys.path.insert(0, "d:/EvoFit")

from fastapi.testclient import TestClient
from backend.main import app
from backend.services import auth_service
from backend.database import models

client = TestClient(app)

def test_cohort_endpoint_auth():
    # 1. Test unauthenticated request (should yield 401)
    response = client.get("/cohort/comparison")
    print("Unauthenticated status code:", response.status_code)
    assert response.status_code == 401
    
def test_cohort_endpoint_authenticated():
    # 2. Test authenticated request by patching get_current_user to return a dummy user
    dummy_user = models.User(
        id=999,
        username="test_athlete",
        email="athlete@evofit.ai",
        is_admin=False,
        level=12,
        xp=4500
    )
    
    app.dependency_overrides[auth_service.get_current_user] = lambda: dummy_user
    
    try:
        response = client.get("/cohort/comparison")
        print("Authenticated status code:", response.status_code)
        assert response.status_code == 200
        
        data = response.json()
        print("Keys returned in response:", list(data.keys()))
        print("Username returned:", data.get("username"))
        print("User stats (bench):", data.get("user_stats", {}).get("bench"))
        print("Community avg (bench):", data.get("community_avg", {}).get("bench"))
        print("Scoring matrix (bench):", data.get("scoring_matrix", {}).get("bench"))
        
        # Verify schema integrity
        assert "user_stats" in data
        assert "community_avg" in data
        assert "scoring_matrix" in data
        assert "coaching_insights" in data
        assert data["username"] in ["test_athlete", "athlete"]
        print("Direct Community Benchmarking verification successful!")
    finally:
        # Clean up overrides
        app.dependency_overrides.clear()

if __name__ == "__main__":
    print("Starting community benchmarking API verification test...")
    test_cohort_endpoint_auth()
    test_cohort_endpoint_authenticated()
    print("Verification completed successfully!")
