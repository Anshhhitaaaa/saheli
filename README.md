# Saheli — Women's Health Companion

Saheli is a comprehensive women's health companion for menstrual tracking, PCOS support, fertility, pregnancy, menopause guidance, medication reminders, and a grounded AI health assistant powered by MongoDB Atlas.

---

## 🚀 Features

- **Cycle & Symptom Tracking:** Intelligently tracks period dates, flow intensity, and daily symptoms.
- **Medication & Supplement Reminders:** Schedules and logs daily medications with discreet reminders.
- **AI Health Assistant:** Grounded, medically-reviewed RAG AI assistant.
- **Community Forum:** Safe, anonymous space for sharing experiences.
- **Data Sharing:** Discreet sharing controls with doctors or caregivers.

---

## 🛠️ Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory (see `.env.example`):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/saheli?retryWrites=true&w=majority
   PORT=5000
   VITE_API_URL=
   ```

3. **Run Dev Server & Backend:**
   In one terminal, start the API backend server:
   ```bash
   npm run server
   ```

   In another terminal, start the Vite frontend dev server:
   ```bash
   npm run dev
   ```

   Open `http://localhost:5173` in your browser.

---

## 🌐 Deployment Instructions

### 1. Deploying Backend to Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Configure the service:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables in Render settings:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String.
   - `PORT`: `5000` (or leave default).
5. Copy your deployed Render URL (e.g. `https://saheli-backend.onrender.com`).

---

### 2. Deploying Frontend to Vercel
1. Import your project into [Vercel](https://vercel.com/).
2. Configure settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable in Vercel settings:
   - `VITE_API_URL`: `https://saheli-backend.onrender.com` (Your deployed Render backend URL).
4. Click **Deploy**.
