"""
Brahma 26 Telegram Bot - Main Entry
"""
import os
import logging
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
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

# Simple HTTP health server for Render (free tier workaround)
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'Bot is running!')
    
    def log_message(self, format, *args):
        pass  # Suppress HTTP logs

def start_health_server():
    port = int(os.getenv("PORT", 10000))
    server = HTTPServer(('0.0.0.0', port), HealthHandler)
    logger.info(f"🌐 Health server running on port {port}")
    server.serve_forever()

def main():
    """Start the bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not set in .env")
        return
    
    # Start health server in background (for Render free tier)
    threading.Thread(target=start_health_server, daemon=True).start()
    
    # Create application
    app = Application.builder().token(token).build()
    
    # Command handlers
    app.add_handler(CommandHandler("start", start_command))
    
    # Callback query handlers (inline buttons)
    app.add_handler(CallbackQueryHandler(menu_callback, pattern="^menu_"))
    app.add_handler(CallbackQueryHandler(category_callback, pattern="^cat_"))
    app.add_handler(CallbackQueryHandler(events_callback, pattern="^events_"))
    app.add_handler(CallbackQueryHandler(event_detail_callback, pattern="^event_"))
    
    # Start polling
    logger.info("🤖 Brahma 26 Bot starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
