import sys, io, requests, pandas as pd

sys.path.insert(0,'ml/models')
sys.path.insert(0,'ml/features')
sys.path.insert(0,'ml')

df  = pd.read_pickle('data/interim/01_data_processed.pkl')
sub = df[df['label']=='squat']
s1  = sub[sub['set']==sub['set'].iloc[0]].copy()

# ── Test 1: CSV ──────────────────────────────────────────
buf = io.BytesIO()
s1.to_csv(buf); buf.seek(0)
r = requests.post('http://localhost:8001/predict/', files={'file':('test.csv', buf, 'text/csv')})
if r.ok:
    d = r.json()
    print(f"CSV  → label={d['predicted_label']}  reps={d['rep_count']}  conf={d['confidence']:.0%}  OK")
else:
    print(f"CSV FAIL: {r.text}")

# ── Test 2: PKL ──────────────────────────────────────────
buf2 = io.BytesIO()
s1.to_pickle(buf2); buf2.seek(0)
r2 = requests.post('http://localhost:8001/predict/', files={'file':('test.pkl', buf2, 'application/octet-stream')})
if r2.ok:
    d2 = r2.json()
    print(f"PKL  → label={d2['predicted_label']}  reps={d2['rep_count']}  conf={d2['confidence']:.0%}  OK")
else:
    print(f"PKL FAIL: {r2.text}")

# ── Test 3: bad file type ────────────────────────────────
r3 = requests.post('http://localhost:8001/predict/', files={'file':('data.json', b'{}', 'application/json')})
print(f"BAD  → status={r3.status_code}  {'OK (rejected)' if r3.status_code == 400 else 'UNEXPECTED'}")
