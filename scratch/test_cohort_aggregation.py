import pandas as pd
import numpy as np
import os

pkl_path = "d:/EvoFit/data/interim/03_data_feature.pkl"
if os.path.exists(pkl_path):
    df = pd.read_pickle(pkl_path)
    # Filter for standard exercises
    exercises = ['bench', 'squat', 'ohp', 'dead', 'row']
    df = df[df['label'].isin(exercises)]
    
    # Let's inspect raw feature averages per participant and exercise
    grouped = df.groupby(['participant', 'label'])
    
    results = {}
    for (part, ex), group in grouped:
        if part not in results:
            results[part] = {}
            
        # Basic raw stats
        raw_power = group['acc_r_temp_mean_ws_5'].mean()
        raw_wobble = group['gyr_r_temp_std_ws_5'].mean()
        raw_dur = group['duration'].mean()
        
        results[part][ex] = {
            "raw_power": raw_power,
            "raw_wobble": raw_wobble,
            "raw_duration": raw_dur
        }
        
    print("Aggregate metrics calculated for:")
    for part in sorted(results.keys()):
        print(f"Participant {part}:")
        for ex in sorted(results[part].keys()):
            stats = results[part][ex]
            print(f"  - {ex}: Power={stats['raw_power']:.4f}, Wobble={stats['raw_wobble']:.4f}, Duration={stats['raw_duration']:.2f}")
else:
    print("PKL not found.")
