import sys, io, os
import requests, pandas as pd
from datetime import date

try:
    from tabulate import tabulate
except ImportError:
    print("Error: 'tabulate' module not found. Please install it to run this test: pip install tabulate")
    sys.exit(1)

BASE_URL = "http://localhost:8000"

# 1. GET AUTH TOKEN
print(f"[*] Authenticating with {BASE_URL}...")
login_data = {"username": "test_pro_user_v2", "password": "test_pass_123"}
try:
    resp = requests.post(f"{BASE_URL}/users/login", json=login_data)
    if resp.status_code != 200:
        print(f"[!] Login failed ({resp.status_code}): {resp.text}")
        print("[!] Ensure the backend is running and 'test_db_direct.py' has been run to create the user.")
        sys.exit(1)
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("[+] Login successful. Token acquired.\n")
except Exception as e:
    print(f"[!] Connection error: {e}")
    sys.exit(1)

# 2. RUN PREDICTIONS
df = pd.read_pickle('data/interim/01_data_processed.pkl')
rows = []

print(f"[*] Running E2E Prediction Tests against {BASE_URL}/predict/ ...")
for ex in ['bench','dead','ohp','row','squat']:
    sub = df[df['label'] == ex]
    if sub.empty:
        print(f"[?] No data found for {ex}, skipping.")
        continue
        
    s1  = sub[sub['set'] == sub['set'].iloc[0]].copy()
    buf = io.BytesIO()
    s1.to_csv(buf)
    buf.seek(0)

    r = requests.post(f'{BASE_URL}/predict/',
                      headers=headers,
                      files={'file': (f'{ex}.csv', buf, 'text/csv')})
    
    if r.status_code != 200:
        print(f"[!] Request failed for {ex}: {r.status_code} {r.text}")
        continue

    d   = r.json()
    pred = d.get('predicted_label', '?')
    reps = d.get('rep_count', 0)
    conf = d.get('confidence', 0)
    ok   = 'PASS' if pred == ex else f'FAIL (got {pred})'
    rows.append({'Exercise': ex, 'Predicted': pred, 'Reps': reps,
                 'Confidence': f'{conf:.0%}', 'Result': ok})

if rows:
    print("\n" + tabulate(rows, headers='keys', tablefmt='grid'))
    passed = sum(1 for r in rows if r['Result'] == 'PASS')
    print(f"\n{passed}/{len(rows)} correct\n")
else:
    print("[!] No results generated.")
