import numpy as np
import pandas as pd

def segment_sets_by_inactivity(df: pd.DataFrame, gap_seconds: float = 3.0, fs: float = 5.0) -> pd.DataFrame:
    """
    Scans the accelerometer vector's scalar magnitude for prolonged periods of low variance
    (inactivity/rest gaps) to segment the DataFrame into distinct temporal sets dynamically.
    """
    if "acc_r" not in df.columns:
        df["acc_r"] = np.sqrt(df["acc_x"]**2 + df["acc_y"]**2 + df["acc_z"]**2)

    # Calculate rolling standard deviation of the magnitude
    # A low std dev corresponds to inactivity.
    window_slots = int(gap_seconds * fs)
    rolling_std = df["acc_r"].rolling(window=window_slots, center=True).std()

    # Determine a threshold for inactivity. Typically, resting noise is < 0.1
    # We will use a dynamically determined threshold based on the 10th percentile
    # of the rolling std or a hard threshold like 0.05.
    threshold = 0.05
    
    # Identify active boolean mask
    is_active = rolling_std > threshold

    # Now assign set numbers. We want to increment set number when we transition from inactive to active.
    # We pad the rolling std linearly to fill NaNs at boundaries
    is_active = is_active.fillna(False).astype(int)

    # Find transitions
    transitions = is_active.diff()
    
    # transitions == 1.0 means went from inactive -> active (start of a set)
    set_starts = (transitions == 1.0)
    
    current_set = 1
    set_labels = []
    
    for _, is_active_val in is_active.items():
        if is_active_val == 1:
            set_labels.append(current_set)
        else:
            set_labels.append(0) # 0 means resting/no set

    df["set_inferred"] = set_labels
    
    # increment current_set whenever we drop back to rest.
    # A better way:
    set_num = 0
    in_set = False
    
    final_sets = []
    for val in is_active:
        if val == 1 and not in_set:
            in_set = True
            set_num += 1
            final_sets.append(set_num)
        elif val == 1 and in_set:
            final_sets.append(set_num)
        elif val == 0:
            in_set = False
            final_sets.append(0)
    
    df["set"] = final_sets
    
    # Clean up any sets that are extremely short (less than 3 seconds)
    min_length = int(3.0 * fs)
    valid_sets = []
    
    current_valid_set = 1
    for s in df["set"].unique():
        if s == 0: continue
        mask = df["set"] == s
        if mask.sum() < min_length:
            df.loc[mask, "set"] = 0
        else:
            df.loc[mask, "set"] = current_valid_set
            current_valid_set += 1

    return df
