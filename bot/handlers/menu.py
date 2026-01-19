"""
Menu callback handlers
"""
import os
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from api_client import get_content, get_categories, get_events

API_BASE = os.getenv("API_BASE_URL", "http://127.0.0.1:3000")

async def menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle main menu button callbacks."""
    query = update.callback_query
    await query.answer()
    
    action = query.data.replace("menu_", "")
    
    if action == "events":
        await show_categories(query)
    elif action == "timeline":
        await show_timeline(query)
    elif action == "contact":
        await show_contact(query)
    elif action == "results":
        await show_results(query)
    elif action == "status":
        await show_status(query)
    elif action == "developer":
        await show_developer(query)
    elif action == "back":
        await show_main_menu(query)

async def show_main_menu(query):
    """Show main menu."""
    keyboard = [
        [InlineKeyboardButton("📅 Event Details", callback_data="menu_events")],
        [InlineKeyboardButton("⏰ Event Timeline", callback_data="menu_timeline")],
        [InlineKeyboardButton("📞 Contact Team", callback_data="menu_contact")],
        [InlineKeyboardButton("🏆 Event Results", callback_data="menu_results")],
        [InlineKeyboardButton("🤖 Bot Status", callback_data="menu_status")],
        [InlineKeyboardButton("👨‍💻 Developer Info", callback_data="menu_developer")]
    ]
    
    await query.edit_message_text(
        "🎊 *Brahma'26 helpline Bot!* 🎉\n\nHow can I help you today?",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_categories(query):
    """Show event categories."""
    categories = ["Technical", "Cultural", "General"]
    
    keyboard = [[InlineKeyboardButton(f"📂 {cat}", callback_data=f"cat_{cat}")] for cat in categories]
    keyboard.append([InlineKeyboardButton("📋 All Events", callback_data="cat_all")])
    keyboard.append([InlineKeyboardButton("🔙 Back", callback_data="menu_back")])
    
    await query.edit_message_text(
        "📅 *Event Details*\n\nSelect a category to view events:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_timeline(query):
    """Show event timeline."""
    events = get_events(active_only=True)
    
    text = "⏰ *Event Timeline*\n\n"
    if events:
        for e in events[:10]:  # Show max 10 events
            name = e.get('name', 'Event')
            time = e.get('start_time', 'TBD')
            text += f"• *{name}*\n  📍 {time}\n\n"
    else:
        text += "No upcoming events scheduled."
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

async def show_contact(query):
    """Show contact team information."""
    content = get_content("emergency_contacts")
    
    text = "📞 *Contact Team*\n\n"
    if content:
        try:
            import json
            contacts = json.loads(content)
            for c in contacts:
                text += f"👤 *{c.get('name', '')}*\n📱 {c.get('phone', '')}\n\n"
        except:
            text += "Contact information unavailable."
    else:
        text += "No contacts available yet.\nCheck back soon!"
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

async def show_results(query):
    """Show event results."""
    events = get_events()
    
    # Filter events that have results
    events_with_results = [e for e in events if e.get('results') and e.get('results').strip()]
    
    text = "🏆 *Event Results*\n\n"
    
    if events_with_results:
        for e in events_with_results[:10]:  # Show max 10
            name = e.get('name', 'Event')
            results = e.get('results', '')
            text += f"*{name}*\n"
            text += f"{results}\n\n"
            text += "─────────────\n\n"
    else:
        text += "No results announced yet.\n"
        text += "Stay tuned for updates! 🎉"
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

async def show_status(query):
    """Show bot status."""
    try:
        r = requests.get(f"{API_BASE}/api/health", timeout=5)
        if r.status_code == 200:
            data = r.json()
            db_status = "✅ Connected" if data.get("database") == "connected" else "❌ Disconnected"
            api_status = "✅ Online"
        else:
            db_status = "❌ Error"
            api_status = "⚠️ Unstable"
    except:
        db_status = "❌ Offline"
        api_status = "❌ Offline"
    
    text = f"""🤖 *Bot Status*

*API Status:* {api_status}
*Database:* {db_status}
*Bot:* ✅ Running

_Last checked: just now_"""
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

async def show_developer(query):
    """Show developer info."""
    text = """👨‍💻 *Developer Info*

*Developed by:* Brahma'26 Tech Team
*Version:* 2.0.0
*Platform:* Vercel + Render

💡 _Built with ❤️ for Brahma 2026_

For issues, contact the organizing committee."""
    
    keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_back")]]
    await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))
