"""
Menu callback handlers
"""
import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from api_client import get_content, get_categories

async def menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle main menu button callbacks."""
    query = update.callback_query
    await query.answer()
    
    action = query.data.replace("menu_", "")
    
    if action == "events":
        await show_categories(query)
    elif action == "announcements":
        await show_announcements(query)
    elif action == "faq":
        await show_faq(query)
    elif action == "emergency":
        await show_emergency(query)
    elif action == "about":
        await show_about(query)
    elif action == "back":
        await show_main_menu(query)

async def show_main_menu(query):
    """Show main menu."""
    keyboard = [
        [InlineKeyboardButton("📅 View Events", callback_data="menu_events")],
        [InlineKeyboardButton("📢 Announcements", callback_data="menu_announcements")],
        [InlineKeyboardButton("❓ FAQ", callback_data="menu_faq")],
        [InlineKeyboardButton("🚨 Emergency Contacts", callback_data="menu_emergency")],
        [InlineKeyboardButton("ℹ️ About", callback_data="menu_about")]
    ]
    
    await query.edit_message_text(
        "🎉 *Brahma 26 Main Menu*\n\nChoose an option:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_categories(query):
    """Show event categories."""
    categories = get_categories()
    
    if not categories:
        keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
        await query.edit_message_text(
            "No event categories found.",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        return
    
    keyboard = [[InlineKeyboardButton(f"📂 {cat}", callback_data=f"cat_{cat}")] for cat in categories]
    keyboard.append([InlineKeyboardButton("📋 All Events", callback_data="cat_all")])
    keyboard.append([InlineKeyboardButton("🔙 Back", callback_data="menu_back")])
    
    await query.edit_message_text(
        "📅 *Select a Category*\n\nChoose a category to view events:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_announcements(query):
    """Show announcements placeholder."""
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(
        "📢 *Announcements*\n\nNo announcements yet. Stay tuned!",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_faq(query):
    """Show FAQ from API."""
    content = get_content("faq")
    
    text = "❓ *Frequently Asked Questions*\n\n"
    if content:
        try:
            faqs = json.loads(content)
            for faq in faqs:
                text += f"*Q: {faq.get('q', '')}*\n{faq.get('a', '')}\n\n"
        except:
            text += "FAQ content unavailable."
    else:
        text += "No FAQs available."
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

async def show_emergency(query):
    """Show emergency contacts."""
    content = get_content("emergency_contacts")
    
    text = "🚨 *Emergency Contacts*\n\n"
    if content:
        try:
            contacts = json.loads(content)
            for c in contacts:
                text += f"📞 *{c.get('name', '')}*: {c.get('phone', '')}\n"
        except:
            text += "Contact information unavailable."
    else:
        text += "No emergency contacts available."
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

async def show_about(query):
    """Show about information."""
    content = get_content("about")
    text = f"ℹ️ *About Brahma 26*\n\n{content or 'Information coming soon!'}"
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))
