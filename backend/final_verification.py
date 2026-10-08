import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:8000"

def get_json(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"Origin": "http://localhost:3000"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run_final_verification():
    results = {}

    print("======================================================================")
    print("VESSEL-X FINAL LIVE INTEGRATION VERIFICATION")
    print("======================================================================")

    # 1. OVERVIEW DASHBOARD
    print("\n--- 1. OVERVIEW DASHBOARD (/api/dashboard/summary) ---")
    try:
        summary = get_json("/api/dashboard/summary")
        assert summary["totalObservations"] == 358351
        assert summary["mlCandidates"] == 3584
        assert summary["mathCandidates"] == 209
        assert summary["modelAgreement"] == 19
        assert summary["mlCandidateRate"] == 1.0
        assert summary["mathOnlyCandidates"] == 190
        assert summary["mlOnlyCandidates"] == 3565
        assert summary["mathThreshold"] == 0.7
        print("  [PASS] All 8 summary metrics verified against live API.")
        results["Overview"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Overview verification failed: {e}")
        results["Overview"] = "FAIL"

    # 2. VESSEL EXPLORER & MMSI 219015871
    print("\n--- 2. VESSEL EXPLORER (/api/vessels) ---")
    try:
        vessels = get_json("/api/vessels?page=1&page_size=10")
        assert vessels["total"] == 358351
        assert len(vessels["data"]) == 10

        search_mmsi = get_json("/api/vessels?mmsi=219015871")
        assert search_mmsi["total"] == 4
        assert len(search_mmsi["data"]) == 4

        single_vessel = get_json("/api/vessels/219015871")
        assert single_vessel["mmsi"] == 219015871
        assert single_vessel["vesselType"] == "SAR"
        assert single_vessel["sog"] == 0.0
        assert single_vessel["headingCogDiff"] == 165.4
        assert single_vessel["mlScore"] == 0.115470
        assert single_vessel["length"] is None
        assert single_vessel["width"] is None
        assert single_vessel["draught"] is None
        print("  [PASS] Pagination, server-side filtering, and MMSI 219015871 verified (unavailable fields remain None).")
        results["Vessel Explorer"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Vessel Explorer verification failed: {e}")
        results["Vessel Explorer"] = "FAIL"

    # 3. ANOMALY DETECTION
    print("\n--- 3. ANOMALY DETECTION (/api/anomalies) ---")
    try:
        both_candidates = get_json("/api/anomalies?detection_status=both_models")
        assert both_candidates["total"] == 19
        single_anomaly = get_json("/api/anomalies/219015871")
        assert single_anomaly["mmsi"] == 219015871
        assert "speedComponent" in single_anomaly
        assert "directionComponent" in single_anomaly
        assert "dimensionComponent" in single_anomaly
        print("  [PASS] Both Models total=19, candidate tabs, and investigation drawer score components verified.")
        results["Anomaly Detection"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Anomaly Detection verification failed: {e}")
        results["Anomaly Detection"] = "FAIL"

    # 4. MODEL COMPARISON
    print("\n--- 4. MODEL COMPARISON (/api/model-comparison) ---")
    try:
        comp = get_json("/api/model-comparison")
        assert comp["mathCandidates"] == 209
        assert comp["mlCandidates"] == 3584
        assert comp["modelAgreement"] == 19
        assert comp["mathOnlyCandidates"] == 190
        assert comp["mlOnlyCandidates"] == 3565
        assert comp["mathThreshold"] == 0.7
        print("  [PASS] Model comparison metrics verified.")
        results["Model Comparison"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Model Comparison verification failed: {e}")
        results["Model Comparison"] = "FAIL"

    # 5. ANALYTICS WORKSPACE
    print("\n--- 5. ANALYTICS WORKSPACE (/api/analytics) ---")
    try:
        analytics = get_json("/api/analytics")
        assert len(analytics["vesselTypes"]) == 17
        assert len(analytics["scoreDistributions"]) == 10
        fishing = next(v for v in analytics["vesselTypes"] if v["type"] == "Fishing")
        assert fishing["count"] == 1546
        assert round(fishing["candidateRate"], 4) == 6.0673
        print("  [PASS] Vessel types (17), score distributions (10 bins), and candidate rates verified.")
        results["Analytics"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Analytics verification failed: {e}")
        results["Analytics"] = "FAIL"

    # 6. DATA QUALITY
    print("\n--- 6. DATA QUALITY (/api/data-quality) ---")
    try:
        dq = get_json("/api/data-quality")
        assert dq["missingSog"] == 458
        assert dq["missingCog"] == 3169
        assert dq["missingHeading"] == 20618
        assert dq["missingWidth"] == 3711
        assert dq["missingLength"] == 3743
        assert dq["missingDraught"] == 25543
        assert dq["incompleteObservations"] == 31720
        assert dq["invalidHeadingRecords"] == 4
        assert "trajectory" in dq["limitationWarning"].lower()
        print("  [PASS] Missing counts, incomplete observations (31,720), invalid headings (4), and trajectory limitation text verified.")
        results["Data Quality"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Data Quality verification failed: {e}")
        results["Data Quality"] = "FAIL"

    # 7. SYSTEM STATUS & HEALTH
    print("\n--- 7. SYSTEM STATUS (/api/health) ---")
    try:
        health = get_json("/api/health")
        assert health["apiStatus"] == "connected"
        assert health["modelConfig"]["estimators"] == 200
        assert health["modelConfig"]["contamination"] == 0.01
        assert health["modelConfig"]["randomState"] == 42
        assert len(health["endpoints"]) == 9
        print("  [PASS] System health, Isolation Forest hyperparams (200 trees, 0.01 contam, seed 42), and 9 endpoints verified.")
        results["System Status"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] System Status verification failed: {e}")
        results["System Status"] = "FAIL"

    # 8. PERFORMANCE & PAGINATION
    print("\n--- 8. PERFORMANCE & PAGINATION ---")
    try:
        vessels_page1 = get_json("/api/vessels?page=1&page_size=10")
        assert len(vessels_page1["data"]) == 10
        assert vessels_page1["total"] == 358351
        print("  [PASS] Server-side pagination verified: returns exactly 10 rows per request, avoiding full 358,351 row browser loads.")
        results["Pagination & Performance"] = "PASS"
    except Exception as e:
        print(f"  [FAIL] Pagination test failed: {e}")
        results["Pagination & Performance"] = "FAIL"

    print("\n======================================================================")
    print("SUMMARY RESULTS:")
    for k, v in results.items():
        print(f"  {k}: {v}")
    print("======================================================================")

if __name__ == "__main__":
    run_final_verification()
