import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Dataset Files
WEEK2_DATA_PATH = OUTPUTS_DIR / "week2_feature_engineered_data.csv"
RAW_DATA_PATH = DATA_DIR / "ais_data.csv"

# Model Configuration
MATHEMATICAL_THRESHOLD = 0.7
ISOLATION_FOREST_ESTIMATORS = 200
ISOLATION_FOREST_CONTAM = 0.01
ISOLATION_FOREST_SEED = 42

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
