import pandas as pd
import os

pkl_path = "d:/EvoFit/data/interim/03_data_feature.pkl"
if os.path.exists(pkl_path):
    print("File exists! Size:", os.path.getsize(pkl_path), "bytes")
    df = pd.read_pickle(pkl_path)
    print("Columns:", list(df.columns[:20]))
    print("Length:", len(df))
    if "participant" in df.columns:
        print("Participants:", df["participant"].value_counts())
    if "label" in df.columns:
        print("Labels:", df["label"].value_counts())
else:
    print("File does not exist at", pkl_path)
