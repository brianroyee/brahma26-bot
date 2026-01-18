# Brahma 26 - Deployment Guide

Deploy the admin dashboard + API on Vercel and the Telegram bot on Render.

## Architecture

```
VERCEL: Admin Dashboard + API Routes (Next.js)
RENDER: Telegram Bot (Python) → calls Vercel API
TURSO: Database (shared)
```

## Vercel Deployment (Admin + API)

### 1. Connect Repository
- Go to [vercel.com](https://vercel.com) and import your GitHub repo
- Set **Root Directory** to `admin`
- Framework: **Next.js** (auto-detected)

### 2. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://brahma26-brianroyee.aws-ap-south-1.turso.io` |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `ADMIN_EMAIL` | `admin@brahma26.com` |
| `ADMIN_PASSWORD` | `admin123` (change in production!) |

### 3. Deploy
Click "Deploy" - Vercel will build and deploy automatically.

### 4. Initialize Admin
After deployment, call the setup endpoint once:
```bash
curl -X POST https://YOUR-APP.vercel.app/api/auth/setup
```

---

## Render Deployment (Bot Only)

### 1. Create Background Worker
- New → Background Worker
- Connect your GitHub repo
- **Root Directory:** `bot`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python main.py`

### 2. Environment Variables

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather |
| `API_BASE_URL` | `https://YOUR-APP.vercel.app` |

### 3. Deploy
Render will start the bot automatically.

---

## Testing

After both are deployed:
1. Open your Vercel URL → login with admin credentials
2. Start the Telegram bot → test `/start` command
3. Create events in admin → verify they appear in bot

---

## Cost

| Service | Cost |
|---------|------|
| Vercel | **Free** (Hobby plan) |
| Render | **Free** (Background Worker) |
| Turso | **Free** (500MB) |
| **Total** | **$0/month** |
