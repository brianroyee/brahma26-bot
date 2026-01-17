"""
Events callback handlers
"""
import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from api_client import get_events, get_event

async def category_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle category selection."""
    query = update.callback_query
    await query.answer()
    
    category = query.data.replace("cat_", "")
    
    if category == "all":
        events = get_events()
    else:
        events = get_events(category=category)
    
    if not events:
        keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_events")]]
        await query.edit_message_text(
            f"No events found in '{category}'.",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        return
    
    # Show list of events
    keyboard = []
    for event in events[:10]:  # Limit to 10
        keyboard.append([
            InlineKeyboardButton(
                f"🎭 {event.get('name', 'Unknown')}",
                callback_data=f"event_{event.get('id')}"
            )
        ])
    
    keyboard.append([InlineKeyboardButton("🔙 Back to Categories", callback_data="menu_events")])
    
    title = "All Events" if category == "all" else category
    await query.edit_message_text(
        f"📅 *{title}*\n\nSelect an event to view details:",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def events_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle events list navigation."""
    query = update.callback_query
    await query.answer()
    # Placeholder for pagination if needed

async def event_detail_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show event details with poster."""
    query = update.callback_query
    await query.answer()
    
    event_id = int(query.data.replace("event_", ""))
    event = get_event(event_id)
    
    if not event:
        keyboard = [[InlineKeyboardButton("🔙 Back", callback_data="menu_events")]]
        await query.edit_message_text("Event not found.", reply_markup=InlineKeyboardMarkup(keyboard))
        return
    
    # Build event details text
    text = f"🎭 *{event.get('name', 'Unknown Event')}*\n\n"
    
    if event.get('description'):
        text += f"{event.get('description')}\n\n"
    
    text += f"📅 *Date:* {event.get('start_time', 'TBD')}\n"
    text += f"📍 *Venue:* {event.get('venue', 'TBD')}\n"
    
    if event.get('rules'):
        text += f"\n📜 *Rules:* {event.get('rules')}\n"
    
    # Volunteer contacts
    if event.get('volunteer_contacts'):
        try:
            contacts = json.loads(event.get('volunteer_contacts', '[]'))
            if contacts:
                text += "\n📞 *Volunteers:*\n"
                for c in contacts:
                    text += f"• {c.get('name', '')}: {c.get('phone', '')}\n"
        except:
            pass
    
    # Hashtags
    if event.get('hashtags'):
        text += f"\n{event.get('hashtags')}"
    
    keyboard = [
        [InlineKeyboardButton("🔙 Back to Events", callback_data="menu_events")]
    ]
    
    # Log interaction
    user_id = update.effective_user.id
    try:
        from api_client import log_interaction
        log_interaction(user_id, "view_event", event.get("name", "Unknown"))
    except:
        pass

    # If event has a poster, send as photo
    if event.get('poster_file_id'):
        try:
            # Delete previous message and send photo
            await query.message.delete()
            await query.message.chat.send_photo(
                photo=event.get('poster_file_id'),
                caption=text,
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            return
        except Exception as e:
            pass  # Fall back to text if photo fails
    
    # No poster, just show text
    await query.edit_message_text(
        text,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
