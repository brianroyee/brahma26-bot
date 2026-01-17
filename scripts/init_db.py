"""
Database initialization script for Brahma 26
Executes each statement separately for reliability.
"""
import os
import requests
from dotenv import load_dotenv

# Load from parent directory .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

def execute_sql(url: str, auth_token: str, sql: str):
    """Execute SQL via Turso HTTP API."""
    if url.startswith("libsql://"):
        url = url.replace("libsql://", "https://")
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "requests": [
            {"type": "execute", "stmt": {"sql": sql}},
            {"type": "close"}
        ]
    }
    
    response = requests.post(f"{url}/v2/pipeline", headers=headers, json=payload)
    return response.json()

def init_database():
    """Initialize database with schema - execute statements individually."""
    url = os.getenv("TURSO_DATABASE_URL")
    auth_token = os.getenv("TURSO_AUTH_TOKEN")
    
    if not url or not auth_token:
        print("❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env")
        return False
    
    print(f"📡 Connecting to Turso database...")
    
    # Execute tables first, then indexes
    statements = [
        # Tables
        """CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            last_active TEXT DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            description TEXT,
            venue TEXT,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            rules TEXT,
            is_active INTEGER DEFAULT 1,
            poster_file_id TEXT,
            poster_caption TEXT,
            hashtags TEXT,
            volunteer_contacts TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            priority TEXT DEFAULT 'normal',
            scheduled_at TEXT,
            sent_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            action TEXT NOT NULL,
            metadata TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS content_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        )""",
        """CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'viewer',
            created_at TEXT DEFAULT (datetime('now'))
        )""",
        # Indexes
        "CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)",
        "CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active)",
        "CREATE INDEX IF NOT EXISTS idx_telemetry_user ON telemetry(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_telemetry_action ON telemetry(action)"
    ]
    
    for i, sql in enumerate(statements):
        try:
            result = execute_sql(url, auth_token, sql)
            results = result.get("results", [])
            if results and results[0].get("type") == "ok":
                print(f"   ✓ Statement {i+1}/{len(statements)} OK")
            else:
                error = results[0].get("error", {}) if results else {}
                print(f"   ⚠ Statement {i+1}: {error.get('message', 'unknown error')}")
        except Exception as e:
            print(f"   ❌ Statement {i+1}: {e}")
    
    print("\n✅ Schema initialization complete!")
    
    # Verify tables
    result = execute_sql(url, auth_token, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    results = result.get("results", [])
    if results and results[0].get("type") == "ok":
        rows = results[0].get("response", {}).get("result", {}).get("rows", [])
        tables = [row[0]["value"] for row in rows if row]
        print(f"📋 Tables created: {', '.join(tables)}")
        return True
    
    return False

if __name__ == "__main__":
    init_database()
