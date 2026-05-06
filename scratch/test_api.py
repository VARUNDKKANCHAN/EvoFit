import requests
import sys

def test_login():
    url = "http://localhost:8000/users/login"
    data = {"username": "admin", "password": "admin"}
    try:
        print(f"Attempting login to {url}...", flush=True)
        r = requests.post(url, json=data, timeout=10)
        print(f"Status: {r.status_code}", flush=True)
        if r.status_code == 200:
            token = r.json()["access_token"]
            print(f"Token: {token[:20]}...", flush=True)
            
            me_url = "http://localhost:8000/users/me"
            headers = {"Authorization": f"Bearer {token}"}
            print(f"Attempting GET to {me_url}...", flush=True)
            r_me = requests.get(me_url, headers=headers, timeout=10)
            print(f"Me Status: {r_me.status_code}", flush=True)
            print(f"Me Response: {r_me.json()}", flush=True)
        else:
            print(f"Error Response: {r.text}", flush=True)
    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    test_login()
