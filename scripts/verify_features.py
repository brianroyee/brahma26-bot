import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@brahma26.com"
ADMIN_PASSWORD = "admin" # Assuming default from setup

def test_endpoints():
    # 1. Login
    print("Testing Login...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Get Admins
    print("\nTesting Get Admins...")
    res = requests.get(f"{BASE_URL}/auth/admins", headers=headers)
    if res.status_code == 200:
        print(f"Admins: {json.dumps(res.json(), indent=2)}")
    else:
        print(f"Get Admins failed: {res.text}")

    # 3. Create/Update Setting
    print("\nTesting Update Setting...")
    res = requests.post(f"{BASE_URL}/settings/", headers=headers, json={
        "key": "test_setting",
        "value": "12345",
        "description": "Test description"
    })
    if res.status_code == 200:
        print("Setting updated.")
    else:
        print(f"Update Setting failed: {res.text}")

    # 4. Get Settings
    print("\nTesting Get Settings...")
    res = requests.get(f"{BASE_URL}/settings/", headers=headers)
    if res.status_code == 200:
        print(f"Settings: {json.dumps(res.json(), indent=2)}")
    else:
        print(f"Get Settings failed: {res.text}")

if __name__ == "__main__":
    test_endpoints()
