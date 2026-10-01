# 🌾 KrishiCopilot (कृषी कोपायलट / कृषि कोपायलट)
### AI-Powered Multilingual Farm Decision Support Platform

> **"From crop photo to smarter farm decisions."**  
> **Detect → Predict → Explain → Recommend → Connect**

KrishiCopilot is a production-quality, software-only agricultural decision support system designed specifically for small and medium-scale Indian farmers, especially those speaking **Marathi (मराठी)** and **Hindi (हिंदी)**. Without requiring external IoT hardware, KrishiCopilot integrates computer vision, agro-meteorological intelligence, a multi-factor crop risk engine, and an agricultural RAG assistant into a unified decision engine.

---

## 🎨 UI/UX Design System (Powered by Stitch)

KrishiCopilot implements the custom **Tactile High-Contrast Utility** design system created in Google Stitch (`projects/7570012998327271127`):

* **Leaf Neural Brand Identity**: Custom SVG logo blending photosynthetic vascular veins with neural net nodes.
* **Palette**:
  * **Primary (`#1B5E20`)**: Deep Forest Emerald with mechanical bottom-lip drop shadows (`shadow-[0_3px_0_0_#0c5216]`).
  * **Secondary (`#65A30D` / `#AEF35E`)**: Sprout Lime high-visibility status badges.
  * **Tertiary (`#D97706` / `#7E4200`)**: Earth Amber cautionary telemetry chips.
  * **Surface System (`#F1FCF3` / `#E5F1E7` / `#FFFFFF`)**: Outdoor high-glare readability.
* **Typography**:
  * **Headlines & Telemetry**: `Space Grotesk` (geometric, open apertures for sunlight legibility).
  * **Body & Chat Stream**: `Plus Jakarta Sans` (ergonomic reading for agricultural advice).
* **Tactile Feedback**: 48px–56px touch bounding boxes with `active:translate-y-0.5` mechanical depression.

---

## 🚀 Core Features

### 1. 📸 Crop Vision Scanner with Explainability
* **Inference Pipeline**: Multi-class leaf disease detection (Early Blight, Late Blight, Yellow Rust, White Rust).
* **Multi-Tier Confidence**:
  * `> 90%`: High confidence with direct action plan.
  * `70% – 90%`: Moderate confidence with field confirmation advisory.
  * `< 70%`: Explicit low-confidence warning: *"The AI is not sufficiently confident. Please retake photo in natural daylight..."*
* **Grad-CAM Explainability**: Visual activation heatmap overlay revealing the exact lesion cluster inspected by the neural network.
* **Audio Advisory**: Instant synthesized speech player in Marathi, Hindi, and English with animated audio waveform.

### 2. 🌦️ Agro-Meteorological Radar & Risk Engine
* **Inputs Synthesized (8 Factors)**:
  `Temperature` × `Humidity` × `Rain Probability` × `Wind Speed` × `Crop` × `Growth Stage` × `Soil Type` × `Disease History`
* **Outputs Generated**:
  * 🔴 **Disease Risk** (Fungal spore pressure)
  * 🟡 **Water Stress** (Soil moisture tension)
  * 🟢 **Heat Stress** (Evapotranspiration rate)
  * 🔴 **Rainfall Risk** (Precipitation wash-off potential)

### 3. 💧 Intelligent Irrigation Advisory Engine
* Synthesizes 36-hour precipitation forecasts, soil moisture holding capacity, and crop stage.
* Precludes fertilizer/chemical wash-off: *"Rain probability is 78%. AVOID / DELAY irrigation for 36 hours."*

### 4. 🌾 Signature Feature: TODAY'S FARM AI
* Unified daily briefing card combining the entire farm context into a 4-step actionable schedule:
  1. *Priority 1 Weather*: Postpone Urea/chemical broadcast.
  2. *Crop Protection*: Targeted foliage sanitation for Early Blight.
  3. *Water Management*: Hold irrigation until post-rain sensor review.
  4. *AI Monitoring*: Rescan canopy 48 hours after rain ceases.

### 5. 🧠 Multilingual RAG Assistant with Verified Citations
* Grounded in agricultural university publications (**ICAR-IIVR, MPKV Rahuri, IIWBR Karnal, Ministry of Agriculture**).
* Transparent source cards displayed under each answer to eliminate hallucination.
* Hands-free voice queries via browser speech-to-text and speech synthesis.

### 6. 📊 APMC Mandi Spot Rates & "Help Near Me"
* Official E-NAM synced prices for Tomato, Wheat, Mustard, and Onion.
* **AI Arbitrage Alert**: Optimal harvest selling window recommendations.
* Directory of verified **Krishi Vigyan Kendras (KVKs)**, Soil Testing Labs, and the national toll-free **Kisan Call Center (`1800-180-1551`)**.

---

## 🏗️ Architecture

```
KrishiCopilot System Architecture
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js / Vite React UI                         │
│   (Stitch Tactile Design • Space Grotesk • Web Speech STT/TTS • PWA)  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST APIs / JSON
┌────────────────────────────────────▼───────────────────────────────────┐
│                           FastAPI Backend                              │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Disease Service  │  │ Weather Service  │  │   Crop Risk Engine   │  │
│  │ (EfficientNet/   │  │ (OpenWeather +   │  │ (8-Factor Agro-Risk  │  │
│  │  Grad-CAM Heat)  │  │  Radar Fallback) │  │  Synthesis Engine)   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Irrigation Engine│  │ RAG Assistant    │  │ Daily Farm AI Engine │  │
│  │ (Soil + Stage +  │  │ (ICAR / MPKV     │  │ (Today's Unified     │  │
│  │  Rain Forecast)  │  │  Knowledge Base) │  │  Action Plan)        │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ SQLAlchemy ORM
┌────────────────────────────────────▼───────────────────────────────────┐
│                     PostgreSQL / SQLite Database                       │
│    (Users • Farms • Scans • Telemetry • Knowledge Docs • Resources)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Running Locally)

### 1. Prerequisites
* Node.js v18+ and npm
* Python 3.10+

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your smartphone or desktop browser.

---

## 🐳 Docker Deployment

To launch the complete production stack (PostgreSQL + FastAPI + NGINX React):
```bash
docker compose up --build
```
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8000`

---

## 🧪 Automated Test Suite

Run unit and integration tests across all services (Disease, Weather, Risk, Irrigation, RAG, Dashboard):
```bash
.\backend\venv\Scripts\pytest.exe tests/test_backend.py -v
```
**Result**: `10 passed in 0.81s`

---

## ⏱️ 3-Minute Hackathon Demonstration Script

1. **Profile Setup (30s)**:
   * Register or log in with your farmer account.
   * Add or customize your farm profile: *Farm Name, Location, Area (Acres), Crop Type, Stage, Soil Type, and Irrigation Method*.
2. **Dashboard & Weather Telemetry (45s)**:
   * View real-time agro-weather: *Temperature, Humidity, Rain Probability*.
   * Point out the **Agro-Meteorological Advisory Banner** warning against chemical top-dressing before rain.
3. **AI Vision Crop Diagnosis & PDF Report Export (60s)**:
   * Navigate to **Diagnosis**. Click **Analyze Crop** or upload your leaf photo.
   * Show animated scanning beam, lesion located bounding box, and **94% Early Blight** detection.
   * Toggle **Grad-CAM Heatmap Layer** to reveal neural attention areas.
   * Play the **Audio Advisory Player** in Hindi or Marathi.
   * Click **Export PDF Report** to generate and download an official certified diagnostic report with exact chemical and organic dosages.
4. **Today's Farm AI & Action Plan (30s)**:
   * Return to Dashboard to show how the scan automatically triggered **TODAY'S FARM AI** 4-step action plan.
   * Show multi-factor risk badges (Disease Risk 🔴 HIGH, Rainfall Risk 🔴 HIGH, Water Stress 🟢 LOW).
5. **Multilingual RAG Assistant (45s)**:
   * Navigate to **Krishi AI**. Tap the microphone or click:
     * *“माझ्या टोमॅटोच्या पानांवर काळे डाग आहेत, काय करावे?”*
   * AI responds in Marathi citing **ICAR-IIVR** crop guides.
   * Switch language pill to Hindi or English with zero reload.
6. **Mandi Arbitrage & Helpline (30s)**:
   * Show APMC spot rates and optimal selling window alert (+₹5,200 estimated gain).
   * Demonstrate one-tap calling to local Nashik KVK or Kisan Call Center (`1800-180-1551`).

---

## 🛡️ Responsible AI Statement

KrishiCopilot is an agronomic decision-support platform designed to assist and empower farmers, not replace qualified agricultural scientists. The application explicitly communicates uncertainty when confidence is below 70%, avoids prescribing chemical dosages without safety notices, and always encourages local consultation with state agricultural officers or KVK agronomists.
