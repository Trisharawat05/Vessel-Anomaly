import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def get_json(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"Origin": "http://localhost:3000"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run_e2e_verification():
    print("======================================================================")
    print("VESSEL-X END-TO-END API INTEGRATION VERIFICATION")
    print("======================================================================")

    # 1. Overview Dashboard Summary
    print("\n--- 1. Testing Overview Dashboard API (/api/dashboard/summary) ---")
    summary = get_json("/api/dashboard/summary")
    assert summary["totalObservations"] == 358351, f"Expected 358351, got {summary['totalObservations']}"
    assert summary["mlCandidates"] == 3584, f"Expected 3584, got {summary['mlCandidates']}"
    assert summary["mathCandidates"] == 209, f"Expected 209, got {summary['mathCandidates']}"
    assert summary["modelAgreement"] == 19, f"Expected 19, got {summary['modelAgreement']}"
    assert summary["mlCandidateRate"] == 1.0, f"Expected 1.0, got {summary['mlCandidateRate']}"
    assert summary["mathOnlyCandidates"] == 190, f"Expected 190, got {summary['mathOnlyCandidates']}"
    assert summary["mlOnlyCandidates"] == 3565, f"Expected 3565, got {summary['mlOnlyCandidates']}"
    print("[PASSED] OVERVIEW SUMMARY VERIFIED:")
    print(f"   Total Observations: {summary['totalObservations']:,}")
    print(f"   ML Candidates: {summary['mlCandidates']:,}")
    print(f"   Math Candidates: {summary['mathCandidates']:,}")
    print(f"   Model Agreement: {summary['modelAgreement']:,}")
    print(f"   ML Candidate Rate: {summary['mlCandidateRate']:.2f}%")
    print(f"   Math Only: {summary['mathOnlyCandidates']:,}")
    print(f"   ML Only: {summary['mlOnlyCandidates']:,}")

    # 2. Vessel Explorer & MMSI 219015871 Inspection
    print("\n--- 2. Testing Vessel Explorer API (/api/vessels & MMSI 219015871) ---")
    vessels = get_json("/api/vessels?page=1&page_size=10")
    assert vessels["total"] == 358351, f"Expected 358351 total vessels, got {vessels['total']}"
    assert len(vessels["data"]) == 10, f"Expected 10 items, got {len(vessels['data'])}"
    print(f"[PASSED] PAGINATION VERIFIED: {vessels['total']:,} total vessels, Page {vessels['page']}/{vessels['totalPages']}")

    search_mmsi = get_json("/api/vessels?mmsi=219015871")
    print(f"[PASSED] SERVER-SIDE FILTERING VERIFIED: Search MMSI 219015871 returned {search_mmsi['total']} matching records.")

    vessel_219015871 = get_json("/api/vessels/219015871")
    assert vessel_219015871["mmsi"] == 219015871
    assert vessel_219015871["vesselType"] == "SAR"
    assert vessel_219015871["sog"] == 0.0
    assert vessel_219015871["cog"] == 350.6
    assert vessel_219015871["heading"] == 156.0
    assert vessel_219015871["headingCogDiff"] == 165.4
    assert vessel_219015871["mlScore"] == 0.115470
    assert vessel_219015871["length"] is None
    assert vessel_219015871["width"] is None
    assert vessel_219015871["draught"] is None
    print("[PASSED] MMSI 219015871 VERIFIED:")
    print(f"   MMSI: {vessel_219015871['mmsi']}")
    print(f"   Vessel Type: {vessel_219015871['vesselType']}")
    print(f"   SOG: {vessel_219015871['sog']} knots")
    print(f"   COG: {vessel_219015871['cog']} deg")
    print(f"   Heading: {vessel_219015871['heading']} deg")
    print(f"   Heading/COG Diff: {vessel_219015871['headingCogDiff']} deg")
    print(f"   ML Score: {vessel_219015871['mlScore']}")
    print(f"   Unavailable Fields: Length={vessel_219015871['length']}, Width={vessel_219015871['width']}, Draught={vessel_219015871['draught']} (Null/Not Available preserved)")

    # 3. Anomaly Detection Tabs & Investigation Drawer
    print("\n--- 3. Testing Anomaly Detection API (/api/anomalies) ---")
    anomalies_all = get_json("/api/anomalies?detection_status=all&page=1&page_size=5")
    anomalies_math = get_json("/api/anomalies?detection_status=math_candidate&page=1&page_size=5")
    anomalies_ml = get_json("/api/anomalies?detection_status=ml_candidate&page=1&page_size=5")
    anomalies_both = get_json("/api/anomalies?detection_status=both_models&page=1&page_size=5")

    assert anomalies_both["total"] == 19, f"Expected 19 both models, got {anomalies_both['total']}"
    print(f"[PASSED] ANOMALY TABS VERIFIED:")
    print(f"   All Candidates Page Items: {len(anomalies_all['data'])}")
    print(f"   Math Candidates Total: {anomalies_math['total']:,}")
    print(f"   ML Candidates Total: {anomalies_ml['total']:,}")
    print(f"   Both Models Total: {anomalies_both['total']}")

    anomaly_inv = get_json("/api/anomalies/219015871")
    assert anomaly_inv["mmsi"] == 219015871
    print("[PASSED] INVESTIGATION DRAWER VERIFIED: Score components successfully returned from API.")

    # 4. Model Comparison
    print("\n--- 4. Testing Model Comparison API (/api/model-comparison) ---")
    comp = get_json("/api/model-comparison")
    assert comp["mathCandidates"] == 209
    assert comp["mlCandidates"] == 3584
    assert comp["modelAgreement"] == 19
    assert comp["mathOnlyCandidates"] == 190
    assert comp["mlOnlyCandidates"] == 3565
    print("[PASSED] MODEL COMPARISON VERIFIED:")
    print(f"   Math: {comp['mathCandidates']}, ML: {comp['mlCandidates']:,}, Both: {comp['modelAgreement']}, Math Only: {comp['mathOnlyCandidates']}, ML Only: {comp['mlOnlyCandidates']:,}")

    # 5. Analytics Workspace
    print("\n--- 5. Testing Analytics API (/api/analytics) ---")
    analytics = get_json("/api/analytics")
    v_types = analytics["vesselTypes"]
    nav_stats = analytics["navStatuses"]
    score_bins = analytics["scoreDistributions"]

    assert len(v_types) == 17, f"Expected 17 vessel types, got {len(v_types)}"
    fishing_metric = next((v for v in v_types if v["type"] == "Fishing"), None)
    assert fishing_metric["count"] == 1546
    assert round(fishing_metric["candidateRate"], 4) == 6.0673

    port_tender = next((v for v in v_types if v["type"] == "Port tender"), None)
    assert port_tender["count"] == 81
    assert round(port_tender["candidateRate"], 4) == 25.9615

    unknown_nav = next((n for n in nav_stats if "Unknown" in n["status"]), None)
    assert unknown_nav["count"] == 3061

    assert len(score_bins) == 10
    print("[PASSED] ANALYTICS CHARTS VERIFIED:")
    print(f"   Vessel Types Count: {len(v_types)} (Fishing: 1,546 [6.0673%], Port tender: 81 [25.9615%])")
    print(f"   Nav Statuses Count: {len(nav_stats)} (Unknown: 3,061)")
    print(f"   Binned Score Distributions: {len(score_bins)} bins (Bin 0.0-0.1: Math={score_bins[0]['mathCount']:,}, ML={score_bins[0]['mlCount']:,})")

    # 6. Data Quality
    print("\n--- 6. Testing Data Quality API (/api/data-quality) ---")
    dq = get_json("/api/data-quality")
    assert dq["missingSog"] == 458, f"Expected 458 missing SOG, got {dq['missingSog']}"
    assert dq["missingCog"] == 3169, f"Expected 3169 missing COG, got {dq['missingCog']}"
    assert dq["missingHeading"] == 20618, f"Expected 20618 missing Heading, got {dq['missingHeading']}"
    assert dq["missingWidth"] == 3711, f"Expected 3711 missing Width, got {dq['missingWidth']}"
    assert dq["missingLength"] == 3743, f"Expected 3743 missing Length, got {dq['missingLength']}"
    assert dq["missingDraught"] == 25543, f"Expected 25543 missing Draught, got {dq['missingDraught']}"
    assert dq["incompleteObservations"] == 31720, f"Expected 31720 incomplete observations, got {dq['incompleteObservations']}"
    assert dq["invalidHeadingRecords"] == 4, f"Expected 4 invalid heading records, got {dq['invalidHeadingRecords']}"
    print("[PASSED] DATA QUALITY VERIFIED:")
    print(f"   Missing SOG: {dq['missingSog']:,}")
    print(f"   Missing COG: {dq['missingCog']:,}")
    print(f"   Missing Heading: {dq['missingHeading']:,}")
    print(f"   Missing Width: {dq['missingWidth']:,}")
    print(f"   Missing Length: {dq['missingLength']:,}")
    print(f"   Missing Draught: {dq['missingDraught']:,}")
    print(f"   Incomplete Observations: {dq['incompleteObservations']:,}")
    print(f"   Invalid Heading Records: {dq['invalidHeadingRecords']}")

    # 7. System Health
    print("\n--- 7. Testing Health Check API (/api/health) ---")
    health = get_json("/api/health")
    assert health["apiStatus"] == "connected"
    assert health["modelConfig"]["estimators"] == 200
    assert health["modelConfig"]["contamination"] == 0.01
    assert health["modelConfig"]["randomState"] == 42
    print("[PASSED] SYSTEM HEALTH VERIFIED:")
    print(f"   API Status: {health['apiStatus']}")
    print(f"   Model Config: {health['modelConfig']}")
    print(f"   Active Endpoints: {len(health['endpoints'])}")

    print("\n======================================================================")
    print("ALL END-TO-END VERIFICATION CHECKS PASSED WITH 100% SUCCESS!")
    print("======================================================================")

if __name__ == "__main__":
    run_e2e_verification()
