"""
Poster Upload Script for Brahma 26
Uploads posters to Telegram and stores file_ids in database.

Usage:
1. Place poster images in posters/ folder
2. Create events.csv with event details
3. Run: python upload_posters.py
"""
import os
import json
import asyncio
import libsql_experimental as libsql
from dotenv import load_dotenv

load_dotenv()

# Import telegram only when needed
try:
    from telegram import Bot
except ImportError:
    print("❌ Please install python-telegram-bot: pip install python-telegram-bot")
    exit(1)

async def upload_poster(bot: Bot, image_path: str, chat_id: str) -> str:
    """Upload a poster to Telegram and return the file_id."""
    with open(image_path, "rb") as photo:
        message = await bot.send_photo(chat_id=chat_id, photo=photo)
        return message.photo[-1].file_id

async def upload_all_posters(posters_dir: str, db_conn):
    """Upload all posters from directory and update database."""
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    admin_chat_id = os.getenv("ADMIN_CHAT_ID")  # Your personal chat ID to receive uploads
    
    if not bot_token:
        print("❌ TELEGRAM_BOT_TOKEN not set in .env")
        return
    
    if not admin_chat_id:
        print("❌ ADMIN_CHAT_ID not set in .env")
        print("   Get your chat ID by sending a message to @userinfobot on Telegram")
        return
    
    bot = Bot(token=bot_token)
    
    # Get list of image files
    image_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    posters = [f for f in os.listdir(posters_dir) if f.lower().endswith(image_extensions)]
    
    print(f"📸 Found {len(posters)} poster images")
    
    for i, poster_file in enumerate(posters, 1):
        image_path = os.path.join(posters_dir, poster_file)
        event_name = os.path.splitext(poster_file)[0]  # Use filename as event name
        
        print(f"[{i}/{len(posters)}] Uploading: {poster_file}")
        
        try:
            file_id = await upload_poster(bot, image_path, admin_chat_id)
            
            # Update or insert event
            existing = db_conn.execute(
                "SELECT id FROM events WHERE name = ?", 
                (event_name,)
            ).fetchone()
            
            if existing:
                db_conn.execute(
                    "UPDATE events SET poster_file_id = ? WHERE name = ?",
                    (file_id, event_name)
                )
            else:
                db_conn.execute(
                    """INSERT INTO events (name, poster_file_id, start_time, end_time)
                       VALUES (?, ?, datetime('now'), datetime('now', '+2 hours'))""",
                    (event_name, file_id)
                )
            
            db_conn.commit()
            print(f"   ✅ Stored file_id for: {event_name}")
            
            # Small delay to avoid rate limits
            await asyncio.sleep(0.5)
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print(f"\n✅ Upload complete! {len(posters)} posters processed.")

def main():
    """Main entry point."""
    url = os.getenv("TURSO_DATABASE_URL")
    auth_token = os.getenv("TURSO_AUTH_TOKEN")
    
    if not url or not auth_token:
        print("❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env")
        return
    
    conn = libsql.connect(database=url, auth_token=auth_token)
    
    # Create posters directory if it doesn't exist
    posters_dir = os.path.join(os.path.dirname(__file__), "..", "posters")
    os.makedirs(posters_dir, exist_ok=True)
    
    if not os.listdir(posters_dir):
        print(f"📁 Place your poster images in: {os.path.abspath(posters_dir)}")
        print("   Filenames will be used as event names.")
        return
    
    asyncio.run(upload_all_posters(posters_dir, conn))

if __name__ == "__main__":
    main()
