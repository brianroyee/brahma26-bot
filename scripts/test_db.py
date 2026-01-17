"""
Quick test to verify Turso database connection and tables.
"""
import os
import asyncio
import libsql_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

async def test_db():
    url = os.getenv("TURSO_DATABASE_URL")
    auth_token = os.getenv("TURSO_AUTH_TOKEN")
    
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://")
    
    print("📡 Testing database connection...")
    
    async with libsql_client.create_client(url=url, auth_token=auth_token) as client:
        # Check tables
        result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        print(f"\n📋 Tables in database:")
        for row in result.rows:
            print(f"   • {row[0]}")
        
        # Check events count
        result = await client.execute("SELECT COUNT(*) FROM events;")
        count = result.rows[0][0] if result.rows else 0
        print(f"\n📊 Events count: {count}")
        
        print("\n✅ Database connection successful!")

if __name__ == "__main__":
    asyncio.run(test_db())
