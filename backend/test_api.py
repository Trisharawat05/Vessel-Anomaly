import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, path, params=""):
    url = f"{BASE_URL}{path}{params}"
    print(f"\n--- Testing [{name}]: {url} ---")
    req = urllib.request.Request(url, headers={"Origin": "http://localhost:3000"})
    try:
        start_t = time.time()
        with urllib.request.urlopen(req) as resp:
            elapsed = time.time() - start_t
            status_code = resp.getcode()
            headers = dict(resp.headers)
            body = resp.read().decode('utf-8')
            data = json.loads(body)
            print(f"Status: {status_code} ({elapsed:.3f}s)")
            print(f"Access-Control-Allow-Origin: {headers.get('access-control-allow-origin')}")
            
            if isinstance(data, dict):
                keys = list(data.keys())
                print(f"Response Keys: {keys}")
                if "total" in data:
                    print(f"Total Items: {data['total']}, Page: {data['page']}/{data['totalPages']}, Returned Rows: {len(data['data'])}")
                elif "totalObservations" in data:
                    print(f"Total Observations: {data['totalObservations']}")
            return True, data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return False, None
    except Exception as e:
        print(f"Error connecting to {url}: {e}")
        return False, None

def run_tests():
    # Wait for server startup
    print("Connecting to FastAPI server...")
    for _ in range(15):
        try:
            with urllib.request.urlopen(f"{BASE_URL}/api/health") as resp:
                if resp.getcode() == 200:
                    print("FastAPI server is UP & READY!")
                    break
        except Exception:
            time.sleep(1)

    # 1. Summary
    test_endpoint("Summary Endpoint", "/api/dashboard/summary")

    # 2. Vessels Paginated
    test_endpoint("Vessels Paginated (Page 1)", "/api/vessels", "?page=1&page_size=5")

    # 3. Vessels Filtered (Fishing)
    test_endpoint("Vessels Filtered (Fishing)", "/api/vessels", "?vessel_type=Fishing&page=1&page_size=5")

    # 4. Vessels Search MMSI (219015871)
    test_endpoint("Vessels Search MMSI", "/api/vessels", "?mmsi=219015871")

    # 5. Single Vessel by MMSI
    test_endpoint("Single Vessel MMSI 219015871", "/api/vessels/219015871")

    # 6. Anomalies Paginated
    test_endpoint("Anomalies Candidates (All)", "/api/anomalies", "?page=1&page_size=5")

    # 7. Anomalies Filtered (Both Models)
    test_endpoint("Anomalies Candidates (Both Models)", "/api/anomalies", "?detection_status=both_models&page=1&page_size=5")

    # 8. Single Anomaly Investigation
    test_endpoint("Single Anomaly Investigation", "/api/anomalies/219015871")

    # 9. Analytics
    test_endpoint("Analytics Endpoint", "/api/analytics")

    # 10. Model Comparison
    test_endpoint("Model Comparison Endpoint", "/api/model-comparison")

    # 11. Data Quality
    test_endpoint("Data Quality Endpoint", "/api/data-quality")

    # 12. Health Check
    test_endpoint("Health Check Endpoint", "/api/health")

if __name__ == "__main__":
    run_tests()
