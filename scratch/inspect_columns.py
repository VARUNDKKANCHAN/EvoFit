import pandas as pd
df = pd.read_pickle("d:/EvoFit/data/interim/03_data_feature.pkl")
cols = sorted(df.columns)
print("Total columns:", len(cols))
print("Sample columns:")
for c in cols:
    if "std" in c or "mean" in c or "entropy" in c or "max" in c or "r_" in c:
        print("  -", c)
