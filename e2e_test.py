import sys, io
sys.path.insert(0,'ml/models')
sys.path.insert(0,'ml/features')
sys.path.insert(0,'ml')
import requests, pandas as pd
from tabulate import tabulate

df = pd.read_pickle('data/interim/01_data_processed.pkl')
rows = []

for ex in ['bench','dead','ohp','row','squat']:
    sub = df[df['label'] == ex]
    s1  = sub[sub['set'] == sub['set'].iloc[0]].copy()
    buf = io.BytesIO()
    s1.to_csv(buf)
    buf.seek(0)

    r = requests.post('http://localhost:8001/predict/',
                      files={'file': (f'{ex}.csv', buf, 'text/csv')})
    d   = r.json()
    pred = d.get('predicted_label', '?')
    reps = d.get('rep_count', 0)
    conf = d.get('confidence', 0)
    ok   = 'PASS' if pred == ex else f'FAIL (got {pred})'
    rows.append({'Exercise': ex, 'Predicted': pred, 'Reps': reps,
                 'Confidence': f'{conf:.0%}', 'Result': ok})

print(tabulate(rows, headers='keys', tablefmt='rounded_outline'))
passed = sum(1 for r in rows if r['Result'] == 'PASS')
print(f"\n{passed}/{len(rows)} correct\n")
