# 🌸 Saheli — Women's Health Companion & AI Health Platform

> **Saheli** *(meaning "trusted friend" in Hindi)* is a full-stack, privacy-first women’s health platform for menstrual cycle tracking, PCOS management, fertility awareness, pregnancy companion guidance, menopause support, location-based gynecologist discovery, consent-gated data sharing, doctor-visit report generation, and data-driven AI medical insights.

---

## 📑 Table of Contents

- [🌟 System Architecture Overview](#-system-architecture-overview)
- [✨ Key Platform Features](#-key-platform-features)
  - [👤 1. Full-Stack Unique Username & Flexible Auth](#-1-full-stack-unique-username--flexible-auth)
  - [🩸 2. Intelligent Cycle & Period Tracking](#-2-intelligent-cycle--period-tracking)
  - [💬 3. Global Real-Time Community Forums & Instant Likes](#-3-global-real-time-community-forums--instant-likes)
  - [🏥 4. Location-Based Gynecologist Discovery & Tele-Consultation](#-4-location-based-gynecologist-discovery--tele-consultation)
  - [🤝 5. Consent-Gated Health Sharing & Public Reader](#-5-consent-gated-health-sharing--public-reader)
  - [🩺 6. Doctor-Visit Summary & PDF Report Generator](#-6-doctor-visit-summary--pdf-report-generator)
  - [🔔 7. User-Isolated Notifications System](#-7-user-isolated-notifications-system)
  - [💊 8. Medication Tracker & Interactive Adherence Calendar](#-8-medication-tracker--interactive-adherence-calendar)
  - [🤖 9. Ask Saheli — LangGraph Data-Driven AI Assistant](#-9-ask-saheli--langgraph-data-driven-ai-assistant)
  - [🤰 10. Pregnancy Companion & Teen Mode](#-10-pregnancy-companion--teen-mode)
  - [📈 11. Insights & Visual Recharts Analytics](#-11-insights--visual-recharts-analytics)
- [🗄️ Database Schema Architecture (PostgreSQL)](#️-database-schema-architecture-postgresql)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Directory & File Structure](#-directory--file-structure)
- [🔑 Environment Variables Setup](#-environment-variables-setup)
- [🚀 Quickstart (Local Development)](#-quickstart-local-development)
- [🚀 Deployment Commands](#-deployment-commands)

---

## 🌟 System Architecture Overview

Saheli is engineered with a decoupled, high-performance architecture:
- **Frontend SPA**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React, React Router v7.
- **Backend API**: Node.js Native HTTP REST API Server.
- **Database Layer**: **PostgreSQL** (`pg` connection pool) with 9 relational tables, custom indices, and `JSONB` support.
- **AI RAG Engine**: **LangGraph + LangChain Multi-LLM RAG Agent** (`server/langgraph_agent.js`) using Groq Llama 3.3 70B & Google Gemini with real-time PostgreSQL user log context injection.

---

## ✨ Key Platform Features

### 👤 1. Full-Stack Unique Username & Flexible Auth
- **Unique Handle Registration**: Enforces unique `@username` handle validation during signup (`/api/auth/signup`) and profile management (`/api/auth/update`).
- **Dual Login Flexibility**: Users can log in using either their unique `@username` or registered `email` address.
- **Live Database Sync**: Automatic profile sync on app mount (`/api/auth/me`) and manual **"Sync with Database"** control in Profile.
- **Consistent Display**: Displays user handles (`@username`) across the Dashboard header, App sidebar, Profile page, and Community posts.

### 🩸 2. Intelligent Cycle & Period Tracking
- **Log Period Start Modal**: Quick date presets (*Today*, *Yesterday*, *2 days ago*, *3 days ago* or custom date picker), flow intensity (`spotting`, `light`, `medium`, `heavy`), and notes.
- **Live Calculations**: Instant recalculation of average cycle length, period duration, current cycle day, and next predicted period start date.
- **Visual Timelines**: Interactive flow timelines and phase breakdown cards (Menstrual, Follicular, Ovulatory, Luteal).

### 💬 3. Global Real-Time Community Forums & Instant Likes
- **Categorized Forums**: Filter discussions by `Periods`, `PCOS`, `Fertility`, `Pregnancy`, `Menopause`, and `General`.
- **Pseudonym Handles**: All posts and reply threads feature the user's real `@username`.
- **0ms Instant Optimistic Likes**: Clicking the Heart icon updates UI state instantly with **zero latency** while syncing with the PostgreSQL `community_posts` `likes` array in the background.
- **Activity Notifications**: Post authors are automatically notified when another user replies to or likes their discussion.

### 🏥 4. Location-Based Gynecologist Discovery & Tele-Consultation (`FindCare`)
- **HTML5 Geolocation Integration**: Uses `navigator.geolocation` to detect user coordinates and automatically resolve their city (`Delhi (NCR)`, `Bengaluru`, `Mumbai`).
- **City Selector**: Manual city picker bar for quick location toggling.
- **Real City Clinics**: Detailed local clinic datasets with addresses, distances, next availability, and phone numbers.
- **Instant "Talk to Gyno" Modal**: One-tap consultation modal displaying the on-duty senior gynecologist with direct phone dialing (`tel:`).

### 🤝 5. Consent-Gated Health Sharing & Public Reader (`Sharing`)
- **Granular Permissions**: Users can grant partners, family members, or doctors specific access to *Cycle History*, *Symptom & Mood Log*, *Pregnancy Updates*, or *Insights*.
- **Instant Access Revocation**: Toggle permissions or click **Revoke** anytime to set `active: false` in PostgreSQL.
- **Dynamic Share Links**: Generates environment-aware share links (`window.location.origin/share/:shareId`).
- **Public Read-Only Viewer (`/share/:shareId`)**: Dedicated read-only view for recipients with access protection and granted scope rendering.

### 🩺 6. Doctor-Visit Summary & PDF Report Generator
- **Live PostgreSQL Data Aggregation**: Compiles cycle logs, flow intensity, symptom history, and average cycle stats into a 1-page report.
- **Custom Doctor Notes**: Dedicated text box to type specific questions or symptoms for physician visits.
- **In-App Report Preview Modal**: Preview summary stats and notes inside the app before printing.
- **Print / Save as PDF**: Opens a print-friendly document ready for printing or downloading as a PDF.
- **Calendar Export (.ics)**: Downloads predicted period dates as an `.ics` file for Google Calendar or Apple Calendar.

### 🔔 7. User-Isolated Notifications System
- **Strict Database Scoping**: Every notification row in `user_notifications` is tied to the user's `email` (`WHERE email = $1`).
- **Independent Read States**: Reading or clearing notifications on User A's account never impacts User B's notification tray.
- **Automatic Signup Welcome Notifications**: Automatically generates personalized welcome & daily check-in notifications for new users upon registration.

### 💊 8. Medication Tracker & Interactive Adherence Calendar
- **Segmented View**: Toggle between `Daily Meds Checklist` and `Medication Calendar`.
- **3 Metric Cards**: Real-time stats for Active Prescriptions, Streak (🔥), and Monthly Adherence (%).
- **Interactive Calendar Grid**: Visual status badges (Green = Taken, Amber = Partial, Gray = Missed, Rose = Today).

### 🤖 9. Ask Saheli — LangGraph Data-Driven AI Assistant
- **Universal Query Handling**: Answers questions on cycle health, PCOS, fertility, nutrition, workouts, and menopause.
- **Real PostgreSQL Predictor**: Analyzes database logs to answer *"When is my next period?"* or *"What phase am I in?"* with exact countdowns.
- **Red-Flag Medical Safety**: Detects clinical emergency keywords and provides immediate medical disclaimers.

### 🤰 10. Pregnancy Companion & Teen Mode
- **Pregnancy Companion**: Week 4 to Week 40 developmental guidance, trimester milestones, and kick counter tool.
- **Teen Mode**: First-period guides, educational resources, and simplified cycle tracking for teenagers.

### 📈 11. Insights & Visual Recharts Analytics
- **Mood Across Entries Line Chart**: Connected directly to real PostgreSQL `symptom_logs`.
- **Named Y-Axis Ticks**: Displays explicit mood labels (**Happy**, **Calm**, **Tired**, **Anxious**, **Sad**).
- **Custom Tooltips**: Displays exact log date, mood emoji, severity (`3/5`), and notes.

---

## 🗄️ Database Schema Architecture (PostgreSQL)

Saheli operates on 9 relational PostgreSQL tables:

```sql
users                     -- User credentials, username, email, focus, pregnancy_mode, pregnancy_week, last_period_start
cycle_logs                -- Period start dates, flow levels, notes (UNIQUE on email, date)
symptom_logs              -- Daily symptoms JSONB, mood labels, severity 1-5, notes
medications               -- Prescriptions, dosage, frequency, taken_dates JSONB history
assistant_chats           -- User AI conversation history, bot responses, sources JSONB, safety flags
community_posts           -- Forums topics, titles, bodies, author, replies JSONB, likes JSONB
share_links               -- Partner/Doctor access tokens, relationship, permissions JSONB, active boolean
user_notifications        -- In-app user notifications & alerts (email, category, title, message, read)
notification_preferences -- Discreet mode settings & category toggles JSONB
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React, React Router v7 |
| **Backend API** | Node.js (Native HTTP Server), ES Modules |
| **Database** | PostgreSQL (`pg` connection pool, hosted on Neon Cloud / Supabase / Local) |
| **AI Framework** | LangGraph, LangChain, Groq Llama 3.3 70B, Google Gemini & Open Inference |
| **Deployment** | Vercel (Frontend SPA), Render (Backend API Service) |

---

## 📁 Directory & File Structure

```text
saaheeli/
├── server/
│   └── langgraph_agent.js      # LangGraph Multi-LLM RAG Engine & Data-Driven Predictor
├── src/
│   ├── animations/
│   │   └── variants.ts         # Framer Motion animation variants (fadeUp, staggerContainer, easeOut)
│   ├── components/
│   │   ├── common/             # Button, Card, Modal, Input, Disclaimer, Logo, ThemeToggle, SeekCareBanner
│   │   ├── layout/             # AppLayout, PublicLayout, AuthLayout
│   │   ├── onboarding/         # OnboardingWalkthrough wizard
│   │   └── tracker/            # LogPeriodStartModal date picker
│   ├── context/
│   │   ├── AuthContext.tsx     # Full-stack auth, PostgreSQL profile auto-sync, username handles
│   │   ├── NotificationContext.tsx # User-isolated notification tray & unread badges
│   │   └── ThemeContext.tsx    # Light/Dark mode state manager
│   ├── pages/
│   │   ├── LandingPage.tsx     # Hero banner, feature showcases, preview cards
│   │   ├── DashboardPage.tsx   # Core hub, cycle status wheel, daily logger shortcuts
│   │   ├── TrackerPage.tsx     # Period log calendar, flow intensity logger, cycle stats
│   │   ├── SymptomsPage.tsx    # Symptom, mood, and severity logger
│   │   ├── AssistantPage.tsx   # "Ask Saheli" AI chat interface with RAG citations
│   │   ├── CommunityPage.tsx   # Topic forums, @username handles, 0ms optimistic likes, reply threads
│   │   ├── FindCarePage.tsx    # HTML5 Geolocation, city selector, Delhi clinics, "Talk to Gyno" modal
│   │   ├── SharingPage.tsx     # Consent-gated share link manager & revocation controls
│   │   ├── ShareViewPage.tsx   # Public read-only viewer page (/share/:shareId)
│   │   ├── DoctorSummaryPage.tsx # Printable PDF generator, custom doctor notes, .ics export
│   │   ├── MedsTrackerPage.tsx # Prescriptions manager, daily checklist, adherence calendar
│   │   ├── InsightsPage.tsx    # Recharts analytics for cycle length trends & mood charts
│   │   ├── PregnancyPage.tsx   # Week-by-week milestone tracker (Week 4-40) & kick counter
│   │   ├── TeenModePage.tsx    # First-period guides & teen cycle tracking
│   │   ├── ProfilePage.tsx     # Handle validation, focus preferences, manual DB sync
│   │   ├── LibraryPage.tsx & ArticlePage.tsx # Evidence-backed health library & reader
│   │   ├── LoginPage.tsx & SignupPage.tsx   # Auth pages supporting username or email login
│   │   └── AboutPage.tsx & ContactPage.tsx   # Mission statement & contact support
│   ├── services/
│   │   ├── api.ts              # Centralized HTTP fetch service for PostgreSQL APIs
│   │   ├── assistantService.ts # AI client service communicating with langgraph_agent.js
│   │   ├── cycleService.ts     # Cycle length & phase calculation engine
│   │   ├── exportService.ts    # Print-friendly PDF summary generator
│   │   └── calendarService.ts  # Standard .ics calendar event exporter
│   ├── App.tsx                 # Client Router (21 routes)
│   └── main.tsx                # App entry point
├── server.js                   # Node.js REST API Server connected to PostgreSQL (9 tables)
├── DESIGN.md                   # Visual design system & aesthetic guidelines
├── CONTENT-GUIDELINES.md       # Medical safety disclaimers & tone principles
├── vercel.json                 # Vercel SPA Routing Configuration
├── vite.config.ts              # Vite dev server configuration & API proxy
└── package.json                # Project dependencies & scripts
```

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Cloud or Local PostgreSQL Connection String
DATABASE_URL=postgresql://<username>:<password>@<host>/<database>?sslmode=require

# Backend Port
PORT=5000

# Frontend API URL (Vite)
# Leave blank for local development (uses Vite dev proxy to http://localhost:5000)
# Set to your live backend URL for production
VITE_API_URL=
```

---

## 🚀 Quickstart (Local Development)

1. **Clone the Repository & Install Dependencies**:
   ```bash
   git clone https://github.com/Anshhhitaaaa/saaheeli.git
   cd saaheeli
   npm install
   ```

2. **Start the Backend API Server**:
   ```bash
   npm run server
   ```
   *Output: `Successfully connected to PostgreSQL database`*

3. **Start the Frontend Development Server**:
   In a second terminal window:
   ```bash
   npm run dev
   ```
   *App available at `http://localhost:5173`*

---

## 🚀 Deployment Commands

To commit and push all recent code, components, and documentation to GitHub:

```bash
git add .
git commit -m "Comprehensive platform documentation, full-stack username auth, community likes, health sharing, and doctor summary features"
git push origin main
```
