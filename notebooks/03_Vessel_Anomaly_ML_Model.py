# ============================================================
# VESSEL ANOMALY DETECTION
# WEEK 3 - MACHINE LEARNING ANOMALY DETECTION
# ============================================================

import os
import warnings

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.impute import SimpleImputer
from sklearn.ensemble import IsolationForest


warnings.filterwarnings("ignore")

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
    "outputs",
    "week2_feature_engineered_data.csv"
)


# ============================================================
# 2. HEADER
# ============================================================

print("=" * 70)
print("VESSEL ANOMALY DETECTION")
print("WEEK 3 - MACHINE LEARNING ANOMALY DETECTION")
print("=" * 70)


# ============================================================
# 3. CHECK WEEK 2 FILE
# ============================================================

if not os.path.exists(DATA_PATH):

    raise FileNotFoundError(
        "\nWeek 2 feature-engineered dataset was not found.\n\n"
        "Expected location:\n"
        f"{DATA_PATH}\n\n"
        "Please run:\n"
        "02_Vessel_Anomaly_Feature_Engineering.py\n"
        "first."
    )


# ============================================================
# 4. LOAD WEEK 2 DATA
# ============================================================

print(
    "\nLoading Week 2 feature-engineered dataset..."
)

df = pd.read_csv(
    DATA_PATH
)

print(
    "\nDataset loaded successfully!"
)

print(
    "Shape:",
    df.shape
)


# ============================================================
# 5. CHECK MATHEMATICAL MODEL
# ============================================================

print("\n" + "=" * 70)
print("CHECKING WEEK 2 MATHEMATICAL MODEL")
print("=" * 70)

required_math_columns = [
    "mathematical_anomaly_score",
    "mathematical_anomaly_flag"
]

missing_math_columns = [
    column
    for column in required_math_columns
    if column not in df.columns
]

if missing_math_columns:

    raise ValueError(
        "\nThe following Week 2 columns are missing:\n"
        + "\n".join(missing_math_columns)
        + "\n\nPlease run the updated Week 2 script first."
    )

print(
    "\nMathematical anomaly score found."
)

print(
    "Mathematical anomaly flag found."
)


# ============================================================
# 6. MATHEMATICAL MODEL SUMMARY
# ============================================================

mathematical_count = (
    df["mathematical_anomaly_flag"] == 1
).sum()

print(
    "\nMathematical anomaly candidates:",
    mathematical_count
)


# ============================================================
# 7. ML FEATURE SELECTION
# ============================================================

print("\n" + "=" * 70)
print("ML FEATURE SELECTION")
print("=" * 70)


features = [

    # Speed
    "sog",
    "context_speed_deviation",
    "context_speed_zscore",

    # Circular direction
    "cog_sin",
    "cog_cos",
    "heading_sin",
    "heading_cos",

    # Heading and COG relationship
    "heading_cog_diff",

    # Vessel dimensions
    "width",
    "length",
    "draught",
    "length_width_ratio",

    # Missing-value indicators
    "sog_missing",
    "cog_missing",
    "heading_missing",
    "width_missing",
    "length_missing",
    "draught_missing",
    "missing_feature_count"
]


print(
    "\nFeatures used by Isolation Forest:"
)

for feature in features:

    print(
        " -",
        feature
    )


# ============================================================
# 8. CHECK FEATURES
# ============================================================

missing_features = [
    feature
    for feature in features
    if feature not in df.columns
]

if missing_features:

    raise ValueError(
        "\nMissing ML features:\n"
        + "\n".join(missing_features)
    )


# ============================================================
# 9. CREATE ML MATRIX
# ============================================================

X = df[
    features
].copy()

print(
    "\nML feature matrix shape:",
    X.shape
)


# ============================================================
# 10. MISSING VALUE ANALYSIS
# ============================================================

print("\n" + "=" * 70)
print("MISSING VALUE ANALYSIS")
print("=" * 70)

missing_values = X.isnull().sum()

print(
    "\nMissing values before imputation:"
)

missing_before = missing_values[
    missing_values > 0
]

if len(missing_before) > 0:

    print(
        missing_before
    )

else:

    print(
        "No missing values found."
    )


# ============================================================
# 11. MEDIAN IMPUTATION
# ============================================================

print("\n" + "=" * 70)
print("MEDIAN IMPUTATION")
print("=" * 70)

imputer = SimpleImputer(
    strategy="median"
)

X_imputed = imputer.fit_transform(
    X
)

print(
    "\nML matrix shape after imputation:",
    X_imputed.shape
)

print(
    "Missing values after imputation:",
    np.isnan(X_imputed).sum()
)


# ============================================================
# 12. ISOLATION FOREST
# ============================================================

print("\n" + "=" * 70)
print("TRAINING ISOLATION FOREST")
print("=" * 70)

model = IsolationForest(
    n_estimators=200,
    contamination=0.01,
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_imputed
)

print(
    "\nIsolation Forest trained successfully!"
)


# ============================================================
# 13. ML ANOMALY PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("GENERATING ML ANOMALY PREDICTIONS")
print("=" * 70)


# Isolation Forest:
#  1  = normal
# -1  = anomaly

df["ml_anomaly_label"] = (
    model.predict(
        X_imputed
    )
)

df["ml_anomaly"] = (
    df["ml_anomaly_label"] == -1
)


# ============================================================
# 14. ML ANOMALY SCORE
# ============================================================

df["ml_anomaly_score"] = (
    -model.decision_function(
        X_imputed
    )
)


# ============================================================
# 15. ML SUMMARY
# ============================================================

normal_count = (
    df["ml_anomaly"] == False
).sum()

ml_anomaly_count = (
    df["ml_anomaly"] == True
).sum()

total_observations = len(df)

ml_anomaly_percentage = (
    ml_anomaly_count
    / total_observations
) * 100


print("\n" + "=" * 70)
print("ML ANOMALY SUMMARY")
print("=" * 70)

print(
    "\nTotal observations:",
    total_observations
)

print(
    "Normal observations:",
    normal_count
)

print(
    "ML anomaly candidates:",
    ml_anomaly_count
)

print(
    "ML anomaly percentage:",
    round(
        ml_anomaly_percentage,
        3
    ),
    "%"
)


# ============================================================
# 16. TOP 20 ML ANOMALY CANDIDATES
# ============================================================

print("\n" + "=" * 70)
print("TOP 20 ML ANOMALY CANDIDATES")
print("=" * 70)

top_ml_anomalies = (
    df.sort_values(
        "ml_anomaly_score",
        ascending=False
    )
    .head(20)
)

display_columns = [

    "mmsi",
    "shiptype",
    "navigationalstatus",

    "sog",

    "context_speed_zscore",

    "heading_cog_diff",

    "length_width_ratio",

    "mathematical_anomaly_score",

    "mathematical_anomaly_flag",

    "ml_anomaly_score",

    "ml_anomaly_label"
]

print(
    top_ml_anomalies[
        display_columns
    ].to_string(
        index=False
    )
)


# ============================================================
# 17. MATHEMATICAL VS ML COMPARISON
# ============================================================

print("\n" + "=" * 70)
print("MATHEMATICAL MODEL VS MACHINE LEARNING MODEL")
print("=" * 70)


mathematical_count = (
    df["mathematical_anomaly_flag"] == 1
).sum()

ml_count = (
    df["ml_anomaly_label"] == -1
).sum()


# Both models
overlap_count = (
    (
        df["mathematical_anomaly_flag"]
        == 1
    )
    &
    (
        df["ml_anomaly_label"]
        == -1
    )
).sum()


# Mathematical model only
math_only = (
    (
        df["mathematical_anomaly_flag"]
        == 1
    )
    &
    (
        df["ml_anomaly_label"]
        != -1
    )
).sum()


# ML model only
ml_only = (
    (
        df["mathematical_anomaly_flag"]
        != 1
    )
    &
    (
        df["ml_anomaly_label"]
        == -1
    )
).sum()


print(
    "\nMathematical model candidates:",
    mathematical_count
)

print(
    "Isolation Forest candidates:",
    ml_count
)

print(
    "Detected by both models:",
    overlap_count
)

print(
    "Detected only by mathematical model:",
    math_only
)

print(
    "Detected only by ML model:",
    ml_only
)


# ============================================================
# 18. ANOMALIES BY SHIP TYPE
# ============================================================

print("\n" + "=" * 70)
print("ML ANOMALIES BY SHIP TYPE")
print("=" * 70)

anomalies_by_type = (
    df[
        df["ml_anomaly"]
    ]
    .groupby("shiptype")
    .size()
    .sort_values(
        ascending=False
    )
)

print(
    anomalies_by_type
)


# ============================================================
# 19. ANOMALIES BY NAVIGATION STATUS
# ============================================================

print("\n" + "=" * 70)
print("ML ANOMALIES BY NAVIGATION STATUS")
print("=" * 70)

anomalies_by_status = (
    df[
        df["ml_anomaly"]
    ]
    .groupby("navigationalstatus")
    .size()
    .sort_values(
        ascending=False
    )
)

print(
    anomalies_by_status
)


# ============================================================
# 20. ANOMALY RATE BY VESSEL TYPE
# ============================================================

shiptype_summary = (
    df.groupby("shiptype")
    .agg(
        total_observations=(
            "mmsi",
            "count"
        ),
        anomaly_count=(
            "ml_anomaly",
            "sum"
        )
    )
)

shiptype_summary[
    "anomaly_rate_%"
] = (
    shiptype_summary[
        "anomaly_count"
    ]
    /
    shiptype_summary[
        "total_observations"
    ]
) * 100


print("\n" + "=" * 70)
print("ANOMALY RATE BY VESSEL TYPE")
print("=" * 70)

print(
    shiptype_summary.sort_values(
        "anomaly_rate_%",
        ascending=False
    )
)


# ============================================================
# 21. GRAPHICAL REPRESENTATION
# ============================================================

print("\n" + "=" * 70)
print("GRAPHICAL ANALYSIS")
print("=" * 70)


# ============================================================
# GRAPH 1
# MATHEMATICAL ANOMALY SCORE DISTRIBUTION
# ============================================================

plt.figure(
    figsize=(10, 6)
)

plt.hist(
    df[
        "mathematical_anomaly_score"
    ].dropna(),
    bins=50
)

plt.axvline(
    0.7,
    linestyle="--",
    linewidth=2,
    label="Mathematical threshold = 0.7"
)

plt.title(
    "Distribution of Mathematical Anomaly Scores"
)

plt.xlabel(
    "Mathematical Anomaly Score"
)

plt.ylabel(
    "Number of Observations"
)

plt.legend()

plt.tight_layout()

plt.show()


# ============================================================
# GRAPH 2
# ISOLATION FOREST SCORE DISTRIBUTION
# ============================================================

plt.figure(
    figsize=(10, 6)
)

plt.hist(
    df[
        "ml_anomaly_score"
    ].dropna(),
    bins=60
)

plt.title(
    "Distribution of Isolation Forest Anomaly Scores"
)

plt.xlabel(
    "ML Anomaly Score"
)

plt.ylabel(
    "Number of Observations"
)

plt.tight_layout()

plt.show()


# ============================================================
# GRAPH 3
# MATHEMATICAL VS ML ANOMALY COUNTS
# ============================================================

methods = [
    "Mathematical Model",
    "Isolation Forest"
]

counts = [
    mathematical_count,
    ml_count
]

plt.figure(
    figsize=(9, 6)
)

plt.bar(
    methods,
    counts
)

plt.title(
    "Anomaly Candidates by Detection Method"
)

plt.xlabel(
    "Detection Method"
)

plt.ylabel(
    "Number of Anomaly Candidates"
)

plt.tight_layout()

plt.show()


# ============================================================
# GRAPH 4
# MODEL AGREEMENT
# ============================================================

agreement_labels = [
    "Both Models",
    "Mathematical Only",
    "ML Only"
]

agreement_values = [
    overlap_count,
    math_only,
    ml_only
]

plt.figure(
    figsize=(9, 6)
)

plt.bar(
    agreement_labels,
    agreement_values
)

plt.title(
    "Agreement Between Mathematical and ML Models"
)

plt.xlabel(
    "Detection Category"
)

plt.ylabel(
    "Number of Observations"
)

plt.tight_layout()

plt.show()


# ============================================================
# GRAPH 5
# TOP 20 ML ANOMALY CANDIDATES
# ============================================================

top_20 = (
    df.nlargest(
        20,
        "ml_anomaly_score"
    )
    .sort_values(
        "ml_anomaly_score"
    )
)

plt.figure(
    figsize=(12, 7)
)

plt.barh(
    range(
        len(top_20)
    ),
    top_20[
        "ml_anomaly_score"
    ]
)

plt.yticks(
    range(
        len(top_20)
    ),
    top_20[
        "mmsi"
    ].astype(str)
)

plt.title(
    "Top 20 Isolation Forest Anomaly Candidates"
)

plt.xlabel(
    "ML Anomaly Score"
)

plt.ylabel(
    "MMSI"
)

plt.tight_layout()

plt.show()


# ============================================================
# GRAPH 6
# ML ANOMALIES BY SHIP TYPE
# ============================================================

plt.figure(
    figsize=(12, 6)
)

anomalies_by_type.plot(
    kind="bar"
)

plt.title(
    "ML Anomaly Candidates by Vessel Type"
)

plt.xlabel(
    "Ship Type"
)

plt.ylabel(
    "Number of Anomaly Candidates"
)

plt.xticks(
    rotation=45
)

plt.tight_layout()

plt.show()


# ============================================================
# GRAPH 7
# SOG VS ML ANOMALY SCORE
# ============================================================

plt.figure(
    figsize=(10, 6)
)

plt.scatter(
    df["sog"],
    df["ml_anomaly_score"],
    s=5,
    alpha=0.3
)

plt.title(
    "Speed Over Ground vs ML Anomaly Score"
)

plt.xlabel(
    "Speed Over Ground (SOG)"
)

plt.ylabel(
    "ML Anomaly Score"
)

plt.tight_layout()

plt.show()


# ============================================================
# 22. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("WEEK 3 COMPLETED")
print("=" * 70)

print(
    "\nWeek 3 completed successfully with:"
)

print(
    "1. Week 2 feature-engineered data"
)

print(
    "2. ML feature selection"
)

print(
    "3. Missing-value analysis"
)

print(
    "4. Median imputation"
)

print(
    "5. Isolation Forest"
)

print(
    "6. ML anomaly scoring"
)

print(
    "7. ML anomaly detection"
)

print(
    "8. Mathematical vs ML comparison"
)

print(
    "9. Vessel-type anomaly analysis"
)

print(
    "10. Navigation-status analysis"
)

print(
    "11. Seven graphical analyses"
)

print(
    "\nNo result CSV files were generated by Week 3."
)

print(
    "\nTotal ML anomaly candidates:",
    ml_count
)

print(
    "Mathematical anomaly candidates:",
    mathematical_count
)

print(
    "Candidates detected by both:",
    overlap_count
)

print(
    "\nWeek 3 analysis finished."
)

print("=" * 70)