# ============================================================
# VESSEL ANOMALY DETECTION
# WEEK 2 - FEATURE ENGINEERING
# AND MATHEMATICAL ANOMALY MODEL
# ============================================================

import os
import numpy as np
import pandas as pd

pd.set_option("display.max_columns", None)


# ============================================================
# 1. PATH SETUP
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "ais_data.csv"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "outputs"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================
# 2. LOAD DATASET
# ============================================================

print("=" * 70)
print("VESSEL ANOMALY DETECTION")
print("WEEK 2 - FEATURE ENGINEERING")
print("=" * 70)

print("\nLoading AIS dataset...")

df = pd.read_csv(DATA_PATH)

print("\nDataset loaded successfully!")
print("Original shape:", df.shape)


# ============================================================
# 3. REMOVE UNNECESSARY INDEX COLUMN
# ============================================================

if "Unnamed: 0" in df.columns:
    df = df.drop(columns=["Unnamed: 0"])

print("\nShape after removing index:", df.shape)


# ============================================================
# 4. HANDLE INVALID HEADING VALUES
# ============================================================

print("\n" + "=" * 70)
print("HEADING VALIDATION")
print("=" * 70)

invalid_heading = (
    (df["heading"] < 0)
    | (df["heading"] > 360)
)

print(
    "Invalid heading records:",
    invalid_heading.sum()
)

df.loc[invalid_heading, "heading"] = np.nan


# ============================================================
# 5. VESSEL-TYPE SPEED STATISTICS
# ============================================================

print("\n" + "=" * 70)
print("VESSEL-TYPE SPEED STATISTICS")
print("=" * 70)

speed_stats = (
    df.groupby("shiptype")["sog"]
    .agg(
        type_median="median",
        type_mean="mean",
        type_std="std"
    )
    .reset_index()
)

print("\nSpeed statistics by vessel type:")
print(speed_stats)


# ============================================================
# 6. MERGE VESSEL-TYPE SPEED STATISTICS
# ============================================================

df = df.merge(
    speed_stats,
    on="shiptype",
    how="left"
)

print(
    "\nDataset shape after adding vessel-type statistics:",
    df.shape
)


# ============================================================
# 7. SPEED DEVIATION
# ============================================================

df["speed_deviation"] = (
    df["sog"] - df["type_median"]
)

print("\nSpeed deviation examples:")

print(
    df[
        [
            "shiptype",
            "sog",
            "type_median",
            "speed_deviation"
        ]
    ].head(20)
)


# ============================================================
# 8. VESSEL-TYPE SPEED Z-SCORE
# ============================================================

df["speed_zscore"] = (
    (df["sog"] - df["type_mean"])
    / df["type_std"]
)

print("\nVessel-type speed z-score examples:")

print(
    df[
        [
            "shiptype",
            "sog",
            "type_mean",
            "type_std",
            "speed_zscore"
        ]
    ].head(20)
)


# ============================================================
# 9. CONTEXTUAL SPEED STATISTICS
#    VESSEL TYPE + NAVIGATION STATUS
# ============================================================

print("\n" + "=" * 70)
print("CONTEXTUAL SPEED FEATURES")
print("=" * 70)

context_speed_stats = (
    df.groupby(
        [
            "shiptype",
            "navigationalstatus"
        ]
    )["sog"]
    .agg(
        context_median="median",
        context_mean="mean",
        context_std="std"
    )
    .reset_index()
)

print(
    "\nSpeed statistics by vessel type "
    "and navigation status:"
)

print(
    context_speed_stats.head(20)
)


# ============================================================
# 10. MERGE CONTEXTUAL SPEED STATISTICS
# ============================================================

df = df.merge(
    context_speed_stats,
    on=[
        "shiptype",
        "navigationalstatus"
    ],
    how="left"
)

print(
    "\nDataset shape after contextual features:",
    df.shape
)


# ============================================================
# 11. CONTEXTUAL SPEED DEVIATION
# ============================================================

df["context_speed_deviation"] = (
    df["sog"] - df["context_median"]
)

print("\nContextual speed deviation:")

print(
    df[
        [
            "shiptype",
            "navigationalstatus",
            "sog",
            "context_median",
            "context_speed_deviation"
        ]
    ].head(20)
)


# ============================================================
# 12. HANDLE SMALL CONTEXTUAL GROUPS
# ============================================================

small_groups = context_speed_stats[
    context_speed_stats["context_std"].isna()
]

print(
    "\nGroups with missing contextual "
    "standard deviation:"
)

print(small_groups)


# ============================================================
# 13. FALLBACK STANDARD DEVIATION
# ============================================================

df["effective_context_std"] = (
    df["context_std"]
    .fillna(df["type_std"])
)

print(
    "\nMissing effective contextual "
    "standard deviation:",
    df["effective_context_std"].isna().sum()
)


# ============================================================
# 14. CONTEXTUAL SPEED Z-SCORE
# ============================================================

df["context_speed_zscore"] = (
    (df["sog"] - df["context_mean"])
    / df["effective_context_std"]
)

print("\nContextual speed z-score:")

print(
    df[
        [
            "shiptype",
            "navigationalstatus",
            "sog",
            "context_mean",
            "effective_context_std",
            "context_speed_zscore"
        ]
    ].head(20)
)


# ============================================================
# 15. CIRCULAR DIRECTION FEATURES
# ============================================================

print("\n" + "=" * 70)
print("CIRCULAR DIRECTION FEATURES")
print("=" * 70)

cog_rad = np.deg2rad(df["cog"])

heading_rad = np.deg2rad(df["heading"])

df["cog_sin"] = np.sin(cog_rad)
df["cog_cos"] = np.cos(cog_rad)

df["heading_sin"] = np.sin(heading_rad)
df["heading_cos"] = np.cos(heading_rad)

print("\nCircular direction features created!")

print(
    df[
        [
            "cog",
            "cog_sin",
            "cog_cos",
            "heading",
            "heading_sin",
            "heading_cos"
        ]
    ].head(20)
)


# ============================================================
# 16. HEADING-COG CIRCULAR DIFFERENCE
# ============================================================

print("\n" + "=" * 70)
print("HEADING-COG DIFFERENCE")
print("=" * 70)

df["heading_cog_diff"] = np.abs(
    (
        df["heading"]
        - df["cog"]
        + 180
    ) % 360 - 180
)

print("\nHeading-COG difference:")

print(
    df[
        [
            "cog",
            "heading",
            "heading_cog_diff"
        ]
    ].head(20)
)

print("\nHeading-COG difference statistics:")

print(
    df["heading_cog_diff"].describe()
)


# ============================================================
# 17. VESSEL DIMENSION FEATURES
# ============================================================

print("\n" + "=" * 70)
print("VESSEL DIMENSION FEATURES")
print("=" * 70)

df["length_width_ratio"] = np.where(
    df["width"] > 0,
    df["length"] / df["width"],
    np.nan
)

print("\nLength-width ratio:")

print(
    df[
        [
            "shiptype",
            "width",
            "length",
            "length_width_ratio"
        ]
    ].head(20)
)

print("\nLength-width ratio statistics:")

print(
    df["length_width_ratio"].describe()
)


# ============================================================
# 18. DIMENSION QUALITY CHECK
# ============================================================

print("\nInvalid or suspicious dimensions:")

print(
    "Width <= 0:",
    (df["width"] <= 0).sum()
)

print(
    "Length <= 0:",
    (df["length"] <= 0).sum()
)

print(
    "Draught <= 0:",
    (df["draught"] <= 0).sum()
)

print("\nMissing dimensions:")

print(
    df[
        [
            "width",
            "length",
            "draught"
        ]
    ].isna().sum()
)


# ============================================================
# 19. MISSING-VALUE INDICATORS
# ============================================================

print("\n" + "=" * 70)
print("MISSING-VALUE FEATURES")
print("=" * 70)

missing_cols = [
    "sog",
    "cog",
    "heading",
    "width",
    "length",
    "draught"
]

for col in missing_cols:

    df[f"{col}_missing"] = (
        df[col].isna().astype(int)
    )


missing_flag_cols = [
    f"{col}_missing"
    for col in missing_cols
]

df["missing_feature_count"] = (
    df[missing_flag_cols].sum(axis=1)
)

print("\nMissing-value indicators created!")

print("\nMissing-value counts:")

print(
    df[missing_cols].isna().sum()
)

print(
    "\nRows with at least one missing feature:",
    (
        df["missing_feature_count"] > 0
    ).sum()
)


# ============================================================
# 20. MATHEMATICAL ANOMALY MODEL
# ============================================================

print("\n" + "=" * 70)
print("MATHEMATICAL ANOMALY MODEL")
print("=" * 70)


# ------------------------------------------------------------
# 20.1 SPEED ANOMALY COMPONENT
# ------------------------------------------------------------

speed_component = np.abs(
    df["context_speed_zscore"]
)

df["speed_anomaly_component"] = (
    np.clip(
        speed_component / 3,
        0,
        1
    )
)


# ------------------------------------------------------------
# 20.2 DIRECTION ANOMALY COMPONENT
# ------------------------------------------------------------

df["direction_anomaly_component"] = (
    df["heading_cog_diff"] / 180
).clip(
    0,
    1
)


# ------------------------------------------------------------
# 20.3 DIMENSION ANOMALY COMPONENT
# ------------------------------------------------------------

ratio_median = (
    df["length_width_ratio"].median()
)

ratio_deviation = np.abs(
    df["length_width_ratio"]
    - ratio_median
)

ratio_std = (
    df["length_width_ratio"].std()
)

df["dimension_anomaly_component"] = (
    np.clip(
        ratio_deviation
        / (3 * ratio_std),
        0,
        1
    )
)


# ------------------------------------------------------------
# 20.4 COMBINE COMPONENTS
# ------------------------------------------------------------

df["mathematical_anomaly_score"] = (
    df["speed_anomaly_component"]
    + df["direction_anomaly_component"]
    + df["dimension_anomaly_component"]
) / 3


print("\nMathematical anomaly score created!")

print("\nMathematical anomaly score statistics:")

print(
    df[
        "mathematical_anomaly_score"
    ].describe()
)


# ============================================================
# 21. MATHEMATICAL ANOMALY FLAG
# ============================================================

MATHEMATICAL_THRESHOLD = 0.7

df["mathematical_anomaly_flag"] = np.where(
    df["mathematical_anomaly_score"]
    >= MATHEMATICAL_THRESHOLD,
    1,
    0
)

mathematical_count = (
    df["mathematical_anomaly_flag"] == 1
).sum()

print(
    "\nMathematical anomaly candidates:",
    mathematical_count
)

print(
    "\nMathematical anomaly flag distribution:"
)

print(
    df[
        "mathematical_anomaly_flag"
    ].value_counts()
)


# ============================================================
# 22. TOP MATHEMATICAL ANOMALY CANDIDATES
# ============================================================

print("\n" + "=" * 70)
print("TOP MATHEMATICAL ANOMALY CANDIDATES")
print("=" * 70)

top_math_anomalies = (
    df.sort_values(
        "mathematical_anomaly_score",
        ascending=False
    )
    [
        [
            "mmsi",
            "shiptype",
            "navigationalstatus",
            "sog",
            "context_speed_zscore",
            "heading_cog_diff",
            "length_width_ratio",
            "mathematical_anomaly_score"
        ]
    ]
    .head(20)
)

print(
    top_math_anomalies.to_string(
        index=False
    )
)


# ============================================================
# 23. FINAL FEATURE SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("WEEK 2 FEATURE SUMMARY")
print("=" * 70)

print("\nFinal dataset shape:", df.shape)

print("\nFinal columns:")

for i, column in enumerate(
    df.columns,
    start=1
):
    print(f"{i:02d}. {column}")


# ============================================================
# 24. SAVE WEEK 2 DATA FOR WEEK 3
# ============================================================

week2_output_path = os.path.join(
    OUTPUT_DIR,
    "week2_feature_engineered_data.csv"
)

df.to_csv(
    week2_output_path,
    index=False
)

print("\n" + "=" * 70)
print("WEEK 2 COMPLETED")
print("=" * 70)

print(
    "\nFeature-engineered dataset saved successfully!"
)

print(
    "Location:",
    week2_output_path
)

print(
    "Dataset shape:",
    df.shape
)

print(
    "Mathematical anomaly candidates:",
    mathematical_count
)

print(
    "\nThis dataset will be used as the input for Week 3."
)

print("=" * 70)