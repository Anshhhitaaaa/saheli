# 🌸 Saheli — Women's Health Companion & AI Health Platform

> **Saheli** *(meaning "trusted friend" in Hindi)* is a full-stack, privacy-first women’s health platform for menstrual tracking, PCOS management, fertility, pregnancy, menopause guidance, and data-driven AI medical insights.

---

## 🌟 System Architecture Overview

Saheli is built on a modern, high-performance tech stack:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend API**: Node.js HTTP REST API Server.
- **Database**: **PostgreSQL** (hosted on Neon Cloud / Supabase / Local PostgreSQL) with 9 relational tables & `JSONB` support.
- **AI Agent**: **LangGraph + LangChain Multi-LLM RAG Engine** (Groq Llama 3.3 70B, Google Gemini & Open Inference Engine) with real-time PostgreSQL user data integration.

---

## ✨ Core Features & Recent Enhancements

### 🩸 1. Intelligent Cycle & Period Tracking
- **Log Period Start Modal**: Quick presets (*Today*, *Yesterday*, *2 days ago*, *3 days ago* or custom date picker), flow intensity (`spotting`, `light`, `medium`, `heavy`), and notes.
- **Live Database Calculations**: Instant recalculation of average cycle length, period duration, current cycle day, and next predicted period start date.
- **Visual Analytics**: Interactive Recharts flow timelines and phase breakdown cards.

### 💊 2. Medication Tracker & Adherence Calendar
- **Left-Aligned Segmented Tab Switcher**: Seamlessly toggle between `Daily Meds Checklist` and `Medication Calendar`.
- **3 Compact Metric Cards**: Real-time stats for **Active Prescriptions**, **Current Streak (🔥)**, and **Monthly Adherence (%)**.
- **Interactive Monthly Calendar Grid**:
  - 🟢 **Green Badge**: All active medications taken.
  - 🟡 **Amber Badge**: Partially taken.
  - ⚪ **Gray Outline**: Unlogged/missed days.
  - 🌹 **Rose Ring**: Highlights today's date.
- **Day Detail Modal**: Click any calendar date to toggle medication compliance for historical or current dates (persisted in PostgreSQL `medications` table `taken_dates` JSONB).

### 📈 3. Insights Page Real-Time Database Analytics
- **Mood Across Entries Line Chart**: Connected directly to real PostgreSQL `symptom_logs`.
- **Named Y-Axis Ticks**: Displays explicit mood labels (**Happy**, **Calm**, **Tired**, **Anxious**, **Sad**).
- **Custom Tooltips**: Interactive tooltips displaying exact log date, mood emoji (`🙂`, `🌿`, `😴`, `😟`, `😠`, `😢`), severity (`3/5`), and notes.
- **Rolling 7-Entry Chart View**: Slices display to the latest 7 entries (`.slice(-7)`) for clean visual aesthetics while retaining 100% of historical data safely in PostgreSQL.

### 🤖 4. Ask Saheli — Universal Data-Driven AI Assistant
- **Universal Query Handling**: Answers ANY user question about health, cycle, PCOS, nutrition, workouts, symptoms, skin, sleep, pregnancy, or menopause like ChatGPT & Gemini.
- **Real PostgreSQL Data Predictions**: Reads user database logs to answer *"When is my next period?"*, *"What day of my cycle am I on?"*, *"What phase am I in?"* with exact dates and countdowns.
- **Phase-Synced Nutrition & Workout Advice**: Computes the user's current cycle phase (Menstrual, Follicular, Ovulatory, Luteal) and provides tailored diet & exercise plans.
- **Clean Plain-Text Presentation**: Automatically strips raw markdown asterisks for clean readability.
- **Red-Flag Medical Safety**: Detects emergency clinical keywords (severe pain, fainting, pregnancy bleeding) and displays immediate care warnings.

### 🤰 5. Pregnancy Companion Mode
- **Weekly Guidance**: Tailored developmental insights from Week 4 through Week 40.
- **Trimester Milestones**: Folate, iron, calcium, hydration, and kick-counter tracking.

### 🩺 6. Doctor Summary Generator
- **Exportable Clinical Reports**: Generates structured 30/60/90-day health summaries for gynecologist appointments.

### 💬 7. Anonymous Community Discussions
- **Topic Forums**: Categorized forums (*PCOS*, *Pregnancy*, *Cycle Basics*, *Mental Wellbeing*) seeded and stored in PostgreSQL `community_posts`.

---

## 🗄️ Database Schema Architecture (PostgreSQL)

Saheli operates on 9 relational PostgreSQL tables:

```sql
users                     -- User credentials, focus area, pregnancy state, last_period_start, has_completed_onboarding
cycle_logs                -- Period start dates, flow levels, notes (UNIQUE on email, date)
symptom_logs              -- Daily symptoms JSONB, mood labels, severity 1-5, notes
medications               -- Prescriptions, dosage, frequency, taken_dates JSONB history
assistant_chats           -- User AI conversation history, bot responses, sources JSONB, safety flags
community_posts           -- Forums topics, titles, bodies, author, replies JSONB
share_links               -- Partner/Doctor access tokens & permissions JSONB
user_notifications        -- In-app notifications & alerts
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

## 📁 Directory Structure

```text
saaheeli/
├── server/
│   └── langgraph_agent.js      # LangGraph Multi-LLM RAG Engine & Data-Driven Predictor
├── src/
│   ├── components/             # Reusable UI components, Modals, Layouts
│   │   ├── common/             # Cards, Buttons, Modals, Badges, Banners
│   │   ├── layout/             # Navigation, AppLayout, PublicLayout
│   │   └── tracker/            # LogPeriodStartModal date picker
│   ├── context/                # AuthContext, ThemeContext, NotificationContext
│   ├── pages/                  # 20+ Feature Pages (Tracker, MedsTrackerPage, InsightsPage, AssistantPage, etc.)
│   ├── services/               # API service layer (api.ts, cycleService.ts, assistantService.ts)
│   ├── App.tsx                 # Client-side Router
│   └── main.tsx                # Client Entry Point
├── .env                        # Local Environment Variables
├── .env.example                # Environment Variables Template
├── server.js                   # Node.js REST API Server connected to PostgreSQL
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
# Set to your live backend on Render for production (e.g. https://saheli-dfmb.onrender.com)
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
   *Open `http://localhost:5173` in your browser.*

---

## 🌐 Production Deployment Guide

### 1. Backend Service (Render)
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variable**: `DATABASE_URL` set to your Neon/Supabase PostgreSQL connection string.

### 2. Frontend SPA (Vercel)
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL` set to `https://saheli-dfmb.onrender.com`.

---

## 👩‍💻 Author & Contact

**Anshita Agrawal**
- 📧 **Email:** [agrawal.anshita07@gmail.com](mailto:agrawal.anshita07@gmail.com)
- 🐙 **GitHub:** [@Anshhhitaaaa](https://github.com/Anshhhitaaaa)

---

## 🔒 Privacy & Medical Disclaimer

- **Privacy First:** Saheli does not sell personal health logs. All share links are opt-in and configurable.
- **Medical Disclaimer:** Information provided by Saheli and its AI Assistant is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
