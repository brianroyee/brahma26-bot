# Brahma 26 - Fest Information & Operations System 🚀

A comprehensive system to manage the Brahma 26 festival, featuring a Telegram Bot for users and a web-based Admin Dashboard for organizers.

## 🌟 Features

### 🤖 Telegram Bot
- **Event Schedule**: View upcoming events and details.
- **Announcements**: Receive real-time broadcast messages.
- **My Profile**: User registration and tracking.
- **Help & Info**: Access FAQs and emergency contacts.

### ⚡ Admin Dashboard
- **Events Management**: Create, edit, and delete festival events.
- **Broadcast System**: Send announcements to all bot users.
- **Content Management**: Update FAQs and static content dynamically.
- **System Health**: Monitor API and Database status.
- **Settings**: Configure system-wide parameters (maintenance mode, contacts).

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python), SQLite/Turso (Database), JWT Auth.
- **Frontend**: Next.js 15, TailwindCSS, Framer Motion, Lucide Icons.
- **Bot**: Python-Telegram-Bot.
- **Database**: Turso (libSQL) / SQLite.

## 📂 Project Structure

```
brahma26/
├── admin/          # Next.js Admin Dashboard
├── backend/        # FastAPI Backend Server
├── bot/            # Telegram Bot Logic
├── scripts/        # Utility scripts (db init, verification)
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Admin Panel Setup
```bash
cd admin
npm install
npm run dev
```

### 3. Bot Setup
```bash
cd bot
pip install -r requirements.txt
python main.py
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Render (Backend/Bot) and Vercel (Frontend).
