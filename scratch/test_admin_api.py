import requests

BASE_URL = "http://127.0.0.1:8000"
ADMIN_URL = f"{BASE_URL}/admin"

# We need a token. Let's try to login as admin.
login_data = {"username": "admin", "password": "admin"}
response = requests.post(f"{BASE_URL}/users/login", data=login_data)

if response.status_code != 200:
    print(f"Login failed: {response.status_code} {response.text}")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

endpoints = [
    "/system-status",
    "/stats",
    "/users",
    "/tokens"
]

for ep in endpoints:
    url = f"{ADMIN_URL}{ep}"
    print(f"Testing {url}...")
    res = requests.get(url, headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code != 200:
        print(f"Error: {res.text}")
    else:
        print(f"Success: {str(res.json())[:100]}...")
