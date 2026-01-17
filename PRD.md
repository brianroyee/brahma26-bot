# 📘 Brahma 26 – Telegram Bot & Web Admin Panel  
**Product Requirements Document (PRD)**  
Version: v1.1 (No Registration System)

---

## 1. Product Overview

### Product Name
**Brahma 26 Fest Information & Operations System**

### Description
A centralized information, announcement, and analytics system for the Brahma 26 college fest.  
The system consists of a Telegram bot for participants and a web-based admin panel for organizers.

⚠️ This system **does NOT handle participant registrations** due to lack of access to the official fest database.

---

## 2. Problem Statement

During college fests:
- Participants struggle to find accurate and up-to-date information
- Volunteers are overwhelmed with repetitive queries
- Event updates are not communicated instantly
- Organizers lack real-time insights into participant interests

Constraints:
- No access to the official registration database
- No authority to manage participant sign-ups

---

## 3. Goals & Objectives

### Primary Goals
- Provide a single source of truth for fest information
- Reduce volunteer workload
- Enable instant communication with participants
- Offer actionable analytics to organizers

### Non-Goals
- Event registrations
- Payment handling
- Certificate generation
- Participant identity verification

---

## 4. User Roles

### 4.1 Participants (Telegram Users)
- View event details and schedules
- Receive announcements and alerts
- Access FAQs and emergency contacts

### 4.2 Admin Roles (Web Panel)

| Role | Permissions |
|----|------------|
| Super Admin | Full system access |
| Event Admin | Manage events & schedules |
| Content Manager | FAQs & announcements |
| Analytics Viewer | Read-only analytics |

---

## 5. System Architecture

```
Telegram Bot
     |
     | REST / Webhooks
     v
Backend API (FastAPI / NestJS)
     |
     |-- PostgreSQL (Events, Content, Telemetry)
     |-- Redis (Optional caching)
     |
Web Admin Panel (Next.js)
```

---

## 6. Telegram Bot – Functional Requirements

### 6.1 User Onboarding
- `/start` command
- Store:
  - Telegram ID
  - Username (if available)
  - First interaction timestamp
- No sensitive personal data collection

---

### 6.2 Main Menu (Inline Buttons)
- 📅 View Events
- 📍 Venues & Directions
- 📢 Announcements
- ❓ Help / FAQs
- 🚨 Emergency Contacts

---

### 6.3 Event Browsing
Users must be able to:
- View events by date or category
- View event details:
  - Event name
  - Description
  - Venue
  - Date & time
  - Rules (if applicable)

⚠️ No registration or slot booking features.

---

### 6.4 Announcements
- Delivered automatically from admin panel
- Supports:
  - Normal announcements
  - Emergency alerts
- Announcements appear:
  - As push messages
  - In a dedicated announcements section

---

### 6.5 Help & FAQs
- Rule-based FAQ system
- Content fetched dynamically from backend
- Editable via admin panel

---

### 6.6 Telemetry Logging
The bot must log:
- `/start` usage
- Menu interactions
- Event views
- FAQ views
- Errors and failed interactions

---

## 7. Web Admin Panel – Functional Requirements

### 7.1 Authentication & Authorization
- Email + password login
- JWT-based authentication
- Role-based access control

---

### 7.2 Event Management
Admins can:
- Create events
- Edit events
- Disable events (soft delete)
- Show/hide events

Event fields:
- Name
- Category
- Description (Markdown supported)
- Venue
- Date & time
- Rules
- Status (Active / Inactive)

Changes must reflect instantly in the Telegram bot.

---

### 7.3 Schedule Management
- Day-wise event timeline
- Venue-based filtering
- Conflict detection (same venue & overlapping time)

---

### 7.4 Announcement Manager
Admins can:
- Draft announcements
- Set priority (Normal / Emergency)
- Schedule announcements
- Push announcements instantly

---

### 7.5 Telemetry & Analytics Dashboard

#### Metrics Tracked
- Total users
- Daily active users
- Event popularity (views)
- Menu usage frequency
- Peak activity hours

---

### 7.6 Content Management (CMS-lite)
Editable content:
- FAQs
- Help text
- Emergency contacts
- Sponsor information
- General fest info

---

### 7.7 System Health Dashboard
- Bot online/offline status
- Last heartbeat timestamp
- API latency
- Error logs

---

## 8. Database Design (Logical)

### users
```
id
telegram_id
username
created_at
last_active
```

### events
```
id
name
category
description
venue
start_time
end_time
is_active
```

### announcements
```
id
title
message
priority
scheduled_at
sent_at
```

### telemetry
```
id
user_id
action
metadata (JSON)
timestamp
```

### content_pages
```
id
key
content
updated_at
```

---

## 9. API Responsibilities

### Bot → Backend
- Fetch events
- Fetch announcements
- Fetch FAQs and content
- Log telemetry

### Admin Panel → Backend
- Event CRUD operations
- Content updates
- Analytics queries
- Announcement scheduling

---

## 10. Security Requirements
- JWT-based authentication
- Role-based authorization
- Rate limiting for bot APIs
- Input validation
- Audit logs for admin actions

---

## 11. Deployment & Infrastructure

| Component | Platform |
|--------|----------|
| Backend | Railway / Render / VPS |
| Frontend | Vercel |
| Database | Supabase / Neon |
| Bot | Same backend server |
| Monitoring | Sentry / Logs |

---

## 12. Testing Strategy
- Unit testing for backend logic
- Bot interaction testing
- Role-based access testing
- Load testing for peak fest traffic

---

## 13. Success Metrics
- High Telegram bot adoption among participants
- Reduction in volunteer helpdesk queries
- Stable performance during fest peak hours
- Actionable insights from telemetry data

---

## 14. Roadmap

### Phase 1 (MVP)
- Event browsing
- Announcements
- FAQs
- Telemetry dashboard

### Phase 2
- Multilingual support
- Venue maps
- Volunteer-only bot commands
- Advanced analytics

---

## 15. Notes
- No participant registration or payment handling
- Bot is read-only for users, write-enabled for admins
- System designed for reuse in future editions of Brahma Fest
