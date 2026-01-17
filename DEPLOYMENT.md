# Deployment Guide 🚀

## 1. Backend (FastAPI)
**Platform:** Railway / Render / DigitalOcean

1. **Environment Variables:**
   - `TURSO_DATABASE_URL`: Your database URL
   - `TURSO_AUTH_TOKEN`: Your auth token
   - `JWT_SECRET_KEY`: A strong random string
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `ADMIN_EMAIL` & `ADMIN_PASSWORD`: For initial setup

2. **Build Command:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Start Command:**
   ```bash
   cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## 2. Telegram Bot
**Platform:** Railway (Worker) / Render (Background Worker)

1. **Environment Variables:**
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `API_BASE_URL`: URL of your deployed Backend (e.g. `https://my-backend.railway.app`)

2. **Start Command:**
   ```bash
   cd bot && python main.py
   ```

## 3. Admin Panel (Next.js)
**Platform:** Vercel (Recommended)

1. **Connect Repository:** Import the `admin/` directory.
   
2. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: URL of your deployed Backend

3. **Build settings:**
   - Framework: Next.js
   - Root Directory: `admin`

## 4. Database (Turso)
- Already remote! No deployment needed.
- Ensure you run `scripts/schema.sql` if starting fresh.
