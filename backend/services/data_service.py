import os
import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from sklearn.impute import SimpleImputer
from sklearn.ensemble import IsolationForest

from backend.config import (
    WEEK2_DATA_PATH,
    MATHEMATICAL_THRESHOLD,
    ISOLATION_FOREST_ESTIMATORS,
    ISOLATION_FOREST_CONTAM,
    ISOLATION_FOREST_SEED,
)

class DataService:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.mmsi_counts: Dict[int, int] = {}
        self.total_observations: int = 0
        self.ml_candidates_count: int = 0
        self.math_candidates_count: int = 0
        self.overlap_count: int = 0
        self.math_only_count: int = 0
        self.ml_only_count: int = 0
        self._load_and_process_data()

    def _load_and_process_data(self):
        if not os.path.exists(WEEK2_DATA_PATH):
            raise FileNotFoundError(f"Dataset file not found at {WEEK2_DATA_PATH}")

        # Load Week 2 feature engineered dataset
        df = pd.read_csv(WEEK2_DATA_PATH)
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])

        # Count total observations per MMSI in the dataset
        mmsi_counts_series = df["mmsi"].value_counts()
        self.mmsi_counts = {int(k): int(v) for k, v in mmsi_counts_series.items()}

        # Define 19 Isolation Forest Features (exact same as 03_Vessel_Anomaly_ML_Model.py)
        ml_features = [
            "sog",
            "context_speed_deviation",
            "context_speed_zscore",
            "cog_sin",
            "cog_cos",
            "heading_sin",
            "heading_cos",
            "heading_cog_diff",
            "width",
            "length",
            "draught",
            "length_width_ratio",
            "sog_missing",
            "cog_missing",
            "heading_missing",
            "width_missing",
            "length_missing",
            "draught_missing",
            "missing_feature_count",
        ]

        X = df[ml_features].copy()
        imputer = SimpleImputer(strategy="median")
        X_imputed = imputer.fit_transform(X)

        model = IsolationForest(
            n_estimators=ISOLATION_FOREST_ESTIMATORS,
            contamination=ISOLATION_FOREST_CONTAM,
            random_state=ISOLATION_FOREST_SEED,
            n_jobs=-1,
        )
        model.fit(X_imputed)

        df["ml_anomaly_label"] = model.predict(X_imputed)
        df["ml_anomaly_score"] = -model.decision_function(X_imputed)

        # Categorize Detection Status
        math_mask = df["mathematical_anomaly_flag"] == 1
        ml_mask = df["ml_anomaly_label"] == -1

        df["detectionStatus"] = "normal"
        df.loc[math_mask & ml_mask, "detectionStatus"] = "both_models"
        df.loc[math_mask & ~ml_mask, "detectionStatus"] = "math_candidate"
        df.loc[~math_mask & ml_mask, "detectionStatus"] = "ml_candidate"

        self.df = df
        self.total_observations = len(df)
        self.math_candidates_count = int(math_mask.sum())
        self.ml_candidates_count = int(ml_mask.sum())
        self.overlap_count = int((math_mask & ml_mask).sum())
        self.math_only_count = int((math_mask & ~ml_mask).sum())
        self.ml_only_count = int((~math_mask & ml_mask).sum())

    def format_row(self, row: pd.Series, idx: int) -> Dict[str, Any]:
        def sanitize_val(val, is_float=False):
            if pd.isna(val) or val is None or (is_float and math.isnan(val)):
                return None
            return float(val) if is_float else val

        sog = sanitize_val(row.get("sog"), is_float=True)
        cog = sanitize_val(row.get("cog"), is_float=True)
        heading = sanitize_val(row.get("heading"), is_float=True)
        length = sanitize_val(row.get("length"), is_float=True)
        width = sanitize_val(row.get("width"), is_float=True)
        draught = sanitize_val(row.get("draught"), is_float=True)

        missing_fields = []
        if sog is None: missing_fields.append("SOG")
        if cog is None: missing_fields.append("COG")
        if heading is None: missing_fields.append("Heading")
        if width is None: missing_fields.append("Width")
        if length is None: missing_fields.append("Length")
        if draught is None: missing_fields.append("Draught")

        math_score = sanitize_val(row.get("mathematical_anomaly_score"), is_float=True)
        ml_score = sanitize_val(row.get("ml_anomaly_score"), is_float=True)
        diff = sanitize_val(row.get("heading_cog_diff"), is_float=True)

        speed_comp = sanitize_val(row.get("speed_anomaly_component"), is_float=True)
        dir_comp = sanitize_val(row.get("direction_anomaly_component"), is_float=True)
        dim_comp = sanitize_val(row.get("dimension_anomaly_component"), is_float=True)

        mmsi = int(row["mmsi"])
        obs_count = self.mmsi_counts.get(mmsi, 1)

        return {
            "id": f"obs-{mmsi}-{idx}",
            "mmsi": mmsi,
            "vesselType": str(row.get("shiptype", "Unknown")),
            "sog": sog,
            "cog": cog,
            "heading": heading,
            "length": length,
            "width": width,
            "draught": draught,
            "navStatus": str(row.get("navigationalstatus", "Unknown")),
            "mathScore": round(math_score, 4) if math_score is not None else None,
            "mlScore": round(ml_score, 6) if ml_score is not None else None,
            "detectionStatus": str(row.get("detectionStatus", "normal")),
            "headingCogDiff": round(diff, 1) if diff is not None else None,
            "speedComponent": round(speed_comp, 2) if speed_comp is not None else None,
            "directionComponent": round(dir_comp, 2) if dir_comp is not None else None,
            "dimensionComponent": round(dim_comp, 2) if dim_comp is not None else None,
            "missingFields": missing_fields,
            "isDemoData": False,
            "vesselObservationCount": obs_count,
        }

    def get_vessels(
        self,
        mmsi: Optional[str] = None,
        vessel_type: Optional[str] = None,
        nav_status: Optional[str] = None,
        detection_status: Optional[str] = None,
        sog_min: Optional[float] = None,
        sog_max: Optional[float] = None,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "mlScore",
        sort_order: str = "desc",
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        filtered = self.df

        if mmsi:
            filtered = filtered[filtered["mmsi"].astype(str).str.contains(mmsi.strip())]
        if vessel_type and vessel_type != "all":
            filtered = filtered[filtered["shiptype"].str.lower() == vessel_type.strip().lower()]
        if nav_status and nav_status != "all":
            filtered = filtered[filtered["navigationalstatus"].str.lower() == nav_status.strip().lower()]
        if detection_status and detection_status != "all":
            filtered = filtered[filtered["detectionStatus"] == detection_status]
        if sog_min is not None:
            filtered = filtered[filtered["sog"] >= sog_min]
        if sog_max is not None:
            filtered = filtered[filtered["sog"] <= sog_max]

        # Sorting mapping
        sort_col_map = {
            "mmsi": "mmsi",
            "vesselType": "shiptype",
            "sog": "sog",
            "mathScore": "mathematical_anomaly_score",
            "mlScore": "ml_anomaly_score",
        }

        col = sort_col_map.get(sort_by, "ml_anomaly_score")
        ascending = sort_order.lower() == "asc"
        filtered = filtered.sort_values(by=col, ascending=ascending, na_position="last")

        total = len(filtered)
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        page = max(1, min(page, total_pages))
        start_idx = (page - 1) * page_size
        page_slice = filtered.iloc[start_idx : start_idx + page_size]

        formatted_data = [
            self.format_row(row, start_idx + i)
            for i, (_, row) in enumerate(page_slice.iterrows())
        ]

        return formatted_data, total, total_pages

    def get_vessel_by_mmsi(self, mmsi: int) -> Optional[Dict[str, Any]]:
        subset = self.df[self.df["mmsi"] == mmsi]
        if subset.empty:
            return None
        # Sort by ml_anomaly_score descending to select highest score candidate observation
        subset_sorted = subset.sort_values(by="ml_anomaly_score", ascending=False)
        row = subset_sorted.iloc[0]
        return self.format_row(row, 0)

# Instantiate singleton service instance
data_service = DataService()
