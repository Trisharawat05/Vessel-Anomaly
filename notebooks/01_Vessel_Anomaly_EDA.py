# ============================================
# VESSEL ANOMALY DETECTION
# Exploratory Data Analysis
# ============================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Display settings
pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", 100)

# Plotting style
sns.set_theme(style="whitegrid")

print("Libraries imported successfully!")

# Load dataset

df = pd.read_csv("data/ais_data.csv")

print("Dataset loaded successfully!")

# Display first 5 rows

df.head()

# Number of rows and columns

print("Number of rows:", df.shape[0])
print("Number of columns:", df.shape[1])

# Column names

df.columns.tolist()

# Data types and non-null counts

df.info()

# Remove unnecessary index column

df = df.drop(columns=["Unnamed: 0"])

print("Shape after removing index:", df.shape)

df.describe()

# Missing value analysis

missing = df.isnull().sum()

missing_percentage = (missing / len(df)) * 100

missing_df = pd.DataFrame({
    "Missing Values": missing,
    "Percentage": missing_percentage
})

missing_df.sort_values(
    by="Percentage",
    ascending=False
)

# Check for duplicate rows

duplicate_count = df.duplicated().sum()

print("Duplicate rows:", duplicate_count)

# Number of unique vessels

print("Unique vessels:", df["mmsi"].nunique())

# Numerical columns

numerical_columns = df.select_dtypes(
    include=np.number
).columns.tolist()

print("Numerical columns:")
print(numerical_columns)

# Categorical columns

categorical_columns = df.select_dtypes(
    exclude=np.number
).columns.tolist()

print("Categorical columns:")
print(categorical_columns)

df["shiptype"].value_counts()

plt.figure(figsize=(12, 6))

sns.countplot(
    data=df,
    y="shiptype",
    order=df["shiptype"].value_counts().index
)

plt.title("Distribution of Vessel Types")
plt.xlabel("Number of AIS Records")
plt.ylabel("Vessel Type")

plt.show()

df["navigationalstatus"].value_counts()

plt.figure(figsize=(12, 6))

sns.countplot(
    data=df,
    y="navigationalstatus",
    order=df["navigationalstatus"].value_counts().index
)

plt.title("Distribution of Navigational Status")
plt.xlabel("Number of AIS Records")
plt.ylabel("Navigation Status")

plt.show()

duplicate_percentage = (
    df.duplicated().sum() / len(df)
) * 100

print(f"Duplicate percentage: {duplicate_percentage:.2f}%")

duplicates = df[df.duplicated(keep=False)]

duplicates.head(20)

duplicates.shape

df.describe()

df.describe().T

df[[
    "sog",
    "cog",
    "heading",
    "width",
    "length",
    "draught"
]].describe().T

for col in [
    "sog",
    "cog",
    "heading",
    "width",
    "length",
    "draught"
]:
    print(f"\n--- {col} ---")
    print("Min:", df[col].min())
    print("Max:", df[col].max())
    print("Mean:", df[col].mean())
    print("Median:", df[col].median())

# Investigate high-speed observations

speed_thresholds = [20, 30, 40, 50, 100]

for threshold in speed_thresholds:
    count = (df["sog"] > threshold).sum()
    percentage = count / len(df) * 100

    print(
        f"SOG > {threshold} knots: "
        f"{count:,} records ({percentage:.3f}%)"
    )

plt.figure(figsize=(12, 5))

sns.histplot(
    data=df,
    x="sog",
    bins=100
)

plt.title("Distribution of Speed Over Ground (SOG)")
plt.xlabel("Speed (knots)")
plt.ylabel("Number of Observations")

plt.show()

print("SOG skewness:", df["sog"].skew())

heading_anomalies = df[df["heading"] > 360]

print("Heading values > 360:", len(heading_anomalies))

heading_anomalies[
    ["mmsi", "heading", "sog", "cog", "shiptype", "navigationalstatus"]
].head(20)

plt.figure(figsize=(12, 5))

sns.histplot(
    data=df,
    x="heading",
    bins=100
)

plt.title("Distribution of Vessel Heading")
plt.xlabel("Heading (degrees)")
plt.ylabel("Number of Observations")

plt.show()

print(
    df[df["heading"] > 360]["heading"]
    .value_counts()
    .sort_index()
)

fig, axes = plt.subplots(1, 3, figsize=(18, 5))

sns.histplot(df["length"], bins=50, ax=axes[0])
axes[0].set_title("Vessel Length")

sns.histplot(df["width"], bins=50, ax=axes[1])
axes[1].set_title("Vessel Width")

sns.histplot(df["draught"], bins=50, ax=axes[2])
axes[2].set_title("Vessel Draught")

plt.tight_layout()
plt.show()

def detect_iqr_outliers(data, column):
    Q1 = data[column].quantile(0.25)
    Q3 = data[column].quantile(0.75)

    IQR = Q3 - Q1

    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    outliers = data[
        (data[column] < lower_bound) |
        (data[column] > upper_bound)
    ]

    return lower_bound, upper_bound, outliers

for column in ["sog", "cog", "heading", "width", "length", "draught"]:

    lower, upper, outliers = detect_iqr_outliers(df, column)

    print(f"\n{column}")
    print(f"Lower bound: {lower:.2f}")
    print(f"Upper bound: {upper:.2f}")
    print(f"Outliers: {len(outliers):,}")
    print(f"Percentage: {len(outliers)/len(df)*100:.2f}%")

#High-speed analysis

for threshold in [20, 30, 40, 50, 100]:
    count = (df["sog"] > threshold).sum()
    print(threshold, count)

#SOG skewness

df["sog"].skew()

#Heading >360 investigation

df[df["heading"] > 360]["heading"].value_counts().sort_index()

heading_invalid = df[df["heading"] > 360]

heading_invalid[
    ["mmsi", "heading", "sog", "cog",
     "shiptype", "navigationalstatus",
     "length", "width", "draught"]
]

print(heading_invalid)

# Average speed by vessel type

df.groupby("shiptype")["sog"].agg(
    ["count", "mean", "median", "max"]
).sort_values(
    "median",
    ascending=False
)

# Speed distribution by vessel type

plt.figure(figsize=(14, 7))

sns.boxplot(
    data=df,
    x="shiptype",
    y="sog"
)

plt.xticks(rotation=45)
plt.title("Speed Distribution by Vessel Type")
plt.xlabel("Vessel Type")
plt.ylabel("Speed Over Ground (knots)")

plt.show()

# Speed by navigational status

df.groupby("navigationalstatus")["sog"].agg(
    ["count", "mean", "median", "max"]
).sort_values(
    "median",
    ascending=False
)

# Investigate extremely high SOG values

high_speed = df[df["sog"] > 100].copy()

print("Records with SOG > 100:", len(high_speed))

high_speed[[
    "mmsi",
    "sog",
    "cog",
    "heading",
    "shiptype",
    "navigationalstatus",
    "length",
    "width",
    "draught"
]].head(30)

high_speed["shiptype"].value_counts()

high_speed["navigationalstatus"].value_counts()

# Extreme-speed records by vessel type
print("\n--- SOG > 100 by Ship Type ---")
print(high_speed["shiptype"].value_counts())

# Extreme-speed records by navigation status
print("\n--- SOG > 100 by Navigation Status ---")
print(high_speed["navigationalstatus"].value_counts())

# Speed statistics by vessel type
print("\n--- Speed Statistics by Ship Type ---")

speed_by_type = df.groupby("shiptype")["sog"].agg(
    count="count",
    mean="mean",
    median="median",
    max="max"
).sort_values("median", ascending=False)

print(speed_by_type)

# 99th percentile speed by vessel type
print("\n--- 99th Percentile SOG by Ship Type ---")

sog_99 = df.groupby("shiptype")["sog"].quantile(0.99).sort_values(ascending=False)

print(sog_99)

# Missing value analysis

missing = pd.DataFrame({
    "Missing Count": df.isnull().sum(),
    "Missing Percentage": (df.isnull().sum() / len(df) * 100).round(2)
})

missing = missing.sort_values("Missing Percentage", ascending=False)

print(missing)

# Visualize missing values

missing_plot = missing[missing["Missing Count"] > 0]

plt.figure(figsize=(10, 5))
sns.barplot(
    x=missing_plot.index,
    y=missing_plot["Missing Percentage"]
)

plt.title("Missing Values by Feature")
plt.ylabel("Missing Percentage (%)")
plt.xlabel("Feature")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Duplicate analysis

duplicate_rows = df[df.duplicated(keep=False)]

print("Total duplicate rows:", len(duplicate_rows))

duplicate_rows.head(20)

# Number of duplicated records per vessel

duplicate_by_vessel = (
    duplicate_rows.groupby("mmsi")
    .size()
    .sort_values(ascending=False)
)

duplicate_by_vessel.head(20)

# Correlation matrix

numeric_features = [
    "sog",
    "cog",
    "heading",
    "width",
    "length",
    "draught"
]

correlation = df[numeric_features].corr()

plt.figure(figsize=(10, 7))

sns.heatmap(
    correlation,
    annot=True,
    fmt=".2f",
    cmap="coolwarm"
)

plt.title("Correlation Matrix of Numerical Features")
plt.tight_layout()
plt.show()

# Distribution of numerical features

features = [
    "sog",
    "width",
    "length",
    "draught"
]

for feature in features:
    plt.figure(figsize=(8, 5))

    sns.histplot(
        df[feature].dropna(),
        bins=50,
        kde=True
    )

    plt.title(f"Distribution of {feature}")
    plt.xlabel(feature)
    plt.ylabel("Frequency")

    plt.tight_layout()
    plt.show()

