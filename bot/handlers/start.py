"""
Start command handler
"""
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from api_client import register_user

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    user = update.effective_user
    
    # Register user in database
    register_user(user.id, user.username)

    welcome_text = f"""🎊 *Brahma'26 helpline Bot!* 🎉

I'm here to assist you with Brahma'26 😊.
How can I help you today?"""
    
    keyboard = [
        [InlineKeyboardButton("📅 Event Details", callback_data="menu_events")],
        [InlineKeyboardButton("⏰ Event Timeline", callback_data="menu_timeline")],
        [InlineKeyboardButton("📞 Contact Team", callback_data="menu_contact")],
        [InlineKeyboardButton("🏆 Event Results", callback_data="menu_results")],
        [InlineKeyboardButton("🤖 Bot Status", callback_data="menu_status")],
        [InlineKeyboardButton("👨‍💻 Developer Info", callback_data="menu_developer")]
    ]
    
    await update.message.reply_text(
        welcome_text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
