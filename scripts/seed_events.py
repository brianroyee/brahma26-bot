import os
import csv
import json
from turso_db import execute_sql, fetch_one

def seed_events(csv_path: str):
    """Seed events from CSV file."""
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        print("   Create events.csv with columns: name,category,description,venue,start_time,end_time")
        return False
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        
        for row in reader:
            try:
                # Check if event already exists
                existing = fetch_one("SELECT id FROM events WHERE name = ?", [row.get('name', '')])
                
                if existing:
                    # Update existing
                    execute_sql("""
                        UPDATE events SET 
                            category = ?, description = ?, venue = ?,
                            start_time = ?, end_time = ?, rules = ?,
                            hashtags = ?, volunteer_contacts = ?, poster_caption = ?
                        WHERE name = ?
                    """, [
                        row.get('category', ''),
                        row.get('description', ''),
                        row.get('venue', ''),
                        row.get('start_time', ''),
                        row.get('end_time', ''),
                        row.get('rules', ''),
                        row.get('hashtags', ''),
                        row.get('volunteer_contacts', '[]'),
                        row.get('poster_caption', ''),
                        row.get('name', '')
                    ])
                    print(f"   ✓ Updated: {row.get('name', 'Unknown')}")
                else:
                    # Insert new
                    execute_sql("""
                        INSERT INTO events 
                        (name, category, description, venue, start_time, end_time, rules, hashtags, volunteer_contacts, poster_caption)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, [
                        row.get('name', ''),
                        row.get('category', ''),
                        row.get('description', ''),
                        row.get('venue', ''),
                        row.get('start_time', ''),
                        row.get('end_time', ''),
                        row.get('rules', ''),
                        row.get('hashtags', ''),
                        row.get('volunteer_contacts', '[]'),
                        row.get('poster_caption', '')
                    ])
                    print(f"   ✓ Added: {row.get('name', 'Unknown')}")
                count += 1
            except Exception as e:
                print(f"   ❌ Error with {row.get('name', 'Unknown')}: {e}")
        
        print(f"\n✅ Seeded {count} events!")
        return True

def seed_content():
    """Seed default content pages."""
    default_content = {
        "faq": json.dumps([
            {"q": "When is Brahma 26?", "a": "January 25-27, 2026"},
            {"q": "Where is the venue?", "a": "Check the Venues section in the bot"},
            {"q": "How do I register?", "a": "Registration is handled through the official college portal"}
        ]),
        "emergency_contacts": json.dumps([
            {"name": "Control Room", "phone": "+91 XXXXX XXXXX"},
            {"name": "Medical", "phone": "+91 XXXXX XXXXX"},
            {"name": "Security", "phone": "+91 XXXXX XXXXX"}
        ]),
        "about": "Brahma 26 is the annual cultural and technical fest of our college. Join us for three days of exciting events, competitions, and performances!"
    }
    
    for key, content in default_content.items():
        try:
            existing = fetch_one("SELECT id FROM content_pages WHERE key = ?", [key])
            if existing:
                execute_sql("UPDATE content_pages SET content = ?, updated_at = datetime('now') WHERE key = ?", [content, key])
            else:
                execute_sql("INSERT INTO content_pages (key, content) VALUES (?, ?)", [key, content])
            print(f"   ✓ Seeded: {key}")
        except Exception as e:
            print(f"   ❌ Error seeding {key}: {e}")
    
    print("\n✅ Default content seeded!")
    return True

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--content":
        seed_content()
    else:
        csv_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "data", "events.csv")
        print(f"📂 Loading events from: {csv_path}")
        seed_events(csv_path)
        print("\nTip: Run with --content flag to seed FAQ and emergency contacts")
