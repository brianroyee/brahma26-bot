"""
Test script for Next.js API routes
"""
import requests

BASE_URL = "http://localhost:3000/api"

def test_setup():
    """Test /api/auth/setup"""
    print("Testing POST /api/auth/setup...")
    r = requests.post(f"{BASE_URL}/auth/setup")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    return r.status_code == 200

def test_login():
    """Test /api/auth/login"""
    print("Testing POST /api/auth/login...")
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@brahma26.com",
        "password": "admin123"
    })
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    if r.status_code == 200:
        return r.json().get("access_token")
    return None

def test_me(token):
    """Test /api/auth/me"""
    print("Testing GET /api/auth/me...")
    r = requests.get(f"{BASE_URL}/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    return r.status_code == 200

def test_events_list():
    """Test /api/events"""
    print("Testing GET /api/events...")
    r = requests.get(f"{BASE_URL}/events")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()[:2] if r.json() else []}")
    return r.status_code == 200

def test_events_categories():
    """Test /api/events/categories"""
    print("Testing GET /api/events/categories...")
    r = requests.get(f"{BASE_URL}/events/categories")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    return r.status_code == 200

def test_create_event(token):
    """Test POST /api/events"""
    print("Testing POST /api/events...")
    r = requests.post(f"{BASE_URL}/events", 
        json={
            "name": "Test Event",
            "category": "Technical",
            "description": "A test event",
            "venue": "Test Venue",
            "start_time": "2026-01-20T10:00",
            "end_time": "2026-01-20T12:00"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.json()}")
    return r.status_code == 200

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Next.js API Routes")
    print("=" * 50)
    
    results = []
    
    results.append(("Setup", test_setup()))
    
    token = test_login()
    results.append(("Login", token is not None))
    
    if token:
        results.append(("Me", test_me(token)))
        results.append(("Create Event", test_create_event(token)))
    
    results.append(("Events List", test_events_list()))
    results.append(("Categories", test_events_categories()))
    
    print("\n" + "=" * 50)
    print("Results:")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {name}: {status}")
