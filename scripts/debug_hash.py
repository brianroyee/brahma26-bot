from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    print("Hashing 'admin123'...")
    h = pwd_context.hash("admin123")
    print(f"Success: {h[:20]}...")
    
    print("Hashing 'change-this-password'...")
    h = pwd_context.hash("change-this-password")
    print(f"Success: {h[:20]}...")
except Exception as e:
    print(f"Error: {e}")
