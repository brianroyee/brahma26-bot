"""
Test script for Sprint 4 API routes
"""
import requests

BASE_URL = "http://localhost:3000/api"
TOKEN = "brahma26-authorized-session"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def test_health():
    print("Testing GET /api/health...")
    r = requests.get(f"{BASE_URL}/health")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    return r.status_code == 200 and r.json().get("status") == "healthy"

def test_content():
    print("Testing POST /api/content...")
    r = requests.post(f"{BASE_URL}/content", json={"key": "test_key", "value": "test_value"}, headers=HEADERS)
    print(f"  POST Status: {r.status_code}")
    
    print("Testing GET /api/content?key=test_key...")
    r2 = requests.get(f"{BASE_URL}/content?key=test_key")
    print(f"  GET Status: {r2.status_code}")
    return r.status_code == 200 and r2.status_code == 200

def test_announcements():
    print("Testing POST /api/announcements...")
    r = requests.post(f"{BASE_URL}/announcements", json={"title": "Test", "message": "Test announcement"}, headers=HEADERS)
    print(f"  POST Status: {r.status_code}")
    
    print("Testing GET /api/announcements...")
    r2 = requests.get(f"{BASE_URL}/announcements")
    print(f"  GET Status: {r2.status_code}")
    return r.status_code == 200 and r2.status_code == 200

def test_settings():
    print("Testing POST /api/settings...")
    r = requests.post(f"{BASE_URL}/settings", json=[{"key": "test_setting", "value": "test"}], headers=HEADERS)
    print(f"  POST Status: {r.status_code}")
    
    print("Testing GET /api/settings...")
    r2 = requests.get(f"{BASE_URL}/settings")
    print(f"  GET Status: {r2.status_code}")
    return r.status_code == 200 and r2.status_code == 200

def test_telemetry():
    print("Testing POST /api/telemetry/log...")
    r = requests.post(f"{BASE_URL}/telemetry/log", json={"user_id": 123, "action": "test"})
    print(f"  POST Status: {r.status_code}")
    
    print("Testing GET /api/telemetry/stats...")
    r2 = requests.get(f"{BASE_URL}/telemetry/stats", headers=HEADERS)
    print(f"  GET Status: {r2.status_code}")
    return r.status_code == 200 and r2.status_code == 200

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Sprint 4 API Routes")
    print("=" * 50)
    
    results = [
        ("Health", test_health()),
        ("Content", test_content()),
        ("Announcements", test_announcements()),
        ("Settings", test_settings()),
        ("Telemetry", test_telemetry()),
    ]
    
    print("\n" + "=" * 50)
    print("Results:")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {name}: {status}")
