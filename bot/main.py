"""
Brahma 26 Telegram Bot - Main Entry
"""
import os
import logging
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

from handlers.start import start_command
from handlers.events import events_callback, event_detail_callback, category_callback
from handlers.menu import menu_callback

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def main():
    """Start the bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not set in .env")
        return
    
    # Create application
    app = Application.builder().token(token).build()
    
    # Command handlers
    app.add_handler(CommandHandler("start", start_command))
    
    # Callback query handlers (inline buttons)
    app.add_handler(CallbackQueryHandler(menu_callback, pattern="^menu_"))
    app.add_handler(CallbackQueryHandler(category_callback, pattern="^cat_"))
    app.add_handler(CallbackQueryHandler(events_callback, pattern="^events_"))
    app.add_handler(CallbackQueryHandler(event_detail_callback, pattern="^event_"))
    
    # Keep-Alive Thread (Prevents Render from sleeping)
    import threading
    import time
    import requests

    def keep_alive():
        url = os.getenv("API_BASE_URL", "http://localhost:3000")
        logger.info(f"⏰ Keep-alive timer started. Pinging {url}/api/health every 14 mins.")
        while True:
            try:
                requests.get(f"{url}/api/health", timeout=10)
                logger.info("⏰ Ping sent to Vercel API.")
            except Exception as e:
                logger.error(f"⏰ Ping failed: {e}")
            time.sleep(840) # 14 minutes

    threading.Thread(target=keep_alive, daemon=True).start()

    # Start polling
    logger.info("🤖 Brahma 26 Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
