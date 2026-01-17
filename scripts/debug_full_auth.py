import sys
import os
import requests
import jwt
from datetime import datetime, timedelta

# Add backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.config import settings
from app.core.database import fetch_one

BASE_URL = "http://localhost:8000"

def debug_auth():
    print("--- Debugging Auth ---")
    
    # 1. Check DB Admin
    admin = fetch_one("SELECT * FROM admins WHERE email = 'admin@brahma26.com'")
    if not admin:
        print("CRITICAL: Admin user not found in DB!")
        return
    print(f"1. Admin found in DB: ID={admin['id']}, Role={admin['role']}")
    
    # 2. Generate Token Manually (simulate backend)
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode = {"sub": admin["email"], "role": admin["role"], "exp": expire}
    token = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    print(f"2. Generated Test Token: {token[:15]}...")
    
    # 3. Test API with Token
    headers = {"Authorization": f"Bearer {token}"}
    print("3. Testing /settings/ endpoint...")
    try:
        res = requests.get(f"{BASE_URL}/settings/", headers=headers)
        print(f"   Status Code: {res.status_code}")
        if res.status_code == 200:
            print("   SUCCESS: API accepted the token.")
        else:
            print(f"   FAILURE: API rejected token. Response: {res.text}")
    except Exception as e:
        print(f"   ERROR calling API: {e}")

if __name__ == "__main__":
    debug_auth()
