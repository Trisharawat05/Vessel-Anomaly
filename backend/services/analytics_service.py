import numpy as np
import pandas as pd
from typing import Dict, Any, List
from backend.services.data_service import data_service

class AnalyticsService:
    def get_dashboard_summary(self) -> Dict[str, Any]:
        return {
            "totalObservations": data_service.total_observations,
            "mlCandidates": data_service.ml_candidates_count,
            "mathCandidates": data_service.math_candidates_count,
            "modelAgreement": data_service.overlap_count,
            "mlCandidateRate": round((data_service.ml_candidates_count / data_service.total_observations) * 100, 2),
            "mathOnlyCandidates": data_service.math_only_count,
            "mlOnlyCandidates": data_service.ml_only_count,
            "mathThreshold": 0.7,
        }

    def get_vessel_type_metrics(self) -> List[Dict[str, Any]]:
        df = data_service.df
        ml_anomalies = df[df["ml_anomaly_label"] == -1]

        summary = (
            df.groupby("shiptype")
            .agg(
                total_obs=("mmsi", "count"),
                ml_candidates=("ml_anomaly_label", lambda s: (s == -1).sum()),
            )
            .reset_index()
        )

        summary["candidate_rate"] = (summary["ml_candidates"] / summary["total_obs"]) * 100
        summary = summary.sort_values(by="ml_candidates", ascending=False)

        return [
            {
                "type": row["shiptype"],
                "count": int(row["ml_candidates"]),
                "candidateRate": float(round(row["candidate_rate"], 4)),
            }
            for _, row in summary.iterrows()
        ]

    def get_navigation_status_metrics(self) -> List[Dict[str, Any]]:
        df = data_service.df
        ml_anomalies = df[df["ml_anomaly_label"] == -1]

        summary = (
            ml_anomalies.groupby("navigationalstatus")
            .size()
            .reset_index(name="count")
            .sort_values(by="count", ascending=False)
        )

        return [
            {
                "status": row["navigationalstatus"],
                "count": int(row["count"]),
            }
            for _, row in summary.iterrows()
        ]

    def get_score_distributions(self) -> List[Dict[str, Any]]:
        df = data_service.df
        bins = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        labels = [f"{bins[i]:.1f} - {bins[i+1]:.1f}" for i in range(len(bins)-1)]

        math_counts, _ = np.histogram(df["mathematical_anomaly_score"].dropna(), bins=bins)
        ml_counts, _ = np.histogram(df["ml_anomaly_score"].dropna(), bins=bins)

        res = []
        for i in range(len(labels)):
            res.append({
                "binRange": labels[i],
                "binStart": bins[i],
                "mathCount": int(math_counts[i]),
                "mlCount": int(ml_counts[i]),
            })

        return res

    def get_analytics(self) -> Dict[str, Any]:
        return {
            "vesselTypes": self.get_vessel_type_metrics(),
            "navStatuses": self.get_navigation_status_metrics(),
            "scoreDistributions": self.get_score_distributions(),
        }

analytics_service = AnalyticsService()
