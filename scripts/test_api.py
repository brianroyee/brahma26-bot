"""
Quick test script for Brahma 26 API
"""
import requests

BASE = "http://127.0.0.1:8000"

def test_api():
    print("🧪 Testing Brahma 26 API\n")
    
    # 1. Root endpoint
    print("1️⃣ Testing root endpoint...")
    r = requests.get(f"{BASE}/")
    print(f"   {r.status_code}: {r.json()}\n")
    
    # 2. Health check
    print("2️⃣ Testing health check...")
    r = requests.get(f"{BASE}/health/")
    print(f"   {r.status_code}: {r.json()}\n")
    
    # 3. Database health
    print("3️⃣ Testing database connection...")
    r = requests.get(f"{BASE}/health/db")
    print(f"   {r.status_code}: {r.json()}\n")
    
    # 4. List events
    print("4️⃣ Testing events list...")
    r = requests.get(f"{BASE}/events/")
    print(f"   {r.status_code}: Found {len(r.json())} events\n")
    
    # 5. Setup admin
    print("5️⃣ Setting up admin user...")
    r = requests.post(f"{BASE}/auth/setup")
    print(f"   {r.status_code}: {r.json()}\n")
    
    # 6. Login
    print("6️⃣ Testing login...")
    r = requests.post(f"{BASE}/auth/login", json={"email": "admin@brahma26.com", "password": "change-this-password"})
    if r.status_code == 200:
        token = r.json().get("access_token")
        print(f"   ✅ Login successful! Token: {token[:30]}...\n")
        
        # 7. Test authenticated endpoint
        print("7️⃣ Testing authenticated /auth/me...")
        r = requests.get(f"{BASE}/auth/me", headers={"Authorization": f"Bearer {token}"})
        print(f"   {r.status_code}: {r.json()}\n")
    else:
        print(f"   {r.status_code}: {r.json()}\n")
    
    print("✅ API Tests Complete!")

if __name__ == "__main__":
    test_api()
