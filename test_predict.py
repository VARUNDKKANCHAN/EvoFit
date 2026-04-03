import pandas as pd
import requests
import json

# 1. Convert our interim tracked data into a CSV that satisfies the API
df = pd.read_pickle("data/interim/01_data_processed.pkl")
# Grab exactly one session (e.g. participant A, bench press, set 1)
df_single = df[(df["label"] == "bench") & (df["set"] == 1)].copy()

print(f"Extracted {len(df_single)} rows for Bench Press Test.")

test_csv = "data/interim/api_test_bench.csv"
df_single.to_csv(test_csv)

# 2. Upload it to the API
url = "http://localhost:8000/predict/"

try:
    with open(test_csv, 'rb') as f:
        files_dict = {'file': ("api_test_bench.csv", f, 'text/csv')}
        response = requests.post(url, files=files_dict)
        
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
