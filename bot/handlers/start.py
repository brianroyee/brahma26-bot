"""
Start command handler
"""
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    user = update.effective_user
    
    # Register user in database
    try:
        import requests
        api_base = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")
        requests.post(f"{api_base}/auth/register_bot_user", json={
            "telegram_id": user.id,
            "username": user.username
        }, timeout=2)
    except Exception as e:
        print(f"User registration failed: {e}")

    welcome_text = f"""
🎉 *Welcome to Brahma 26!* 🎉

Hi {user.first_name}! I'm your guide to the Brahma 26 college fest.

Use the menu below to explore events, get updates, and find help!
"""
    
    keyboard = [
        [InlineKeyboardButton("📅 View Events", callback_data="menu_events")],
        [InlineKeyboardButton("📢 Announcements", callback_data="menu_announcements")],
        [InlineKeyboardButton("❓ FAQ", callback_data="menu_faq")],
        [InlineKeyboardButton("🚨 Emergency Contacts", callback_data="menu_emergency")],
        [InlineKeyboardButton("ℹ️ About", callback_data="menu_about")]
    ]
    
    await update.message.reply_text(
        welcome_text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
