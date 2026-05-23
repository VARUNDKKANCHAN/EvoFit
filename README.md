# EvoFit — AI-Powered Fitness Tracking System

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-7C3AED)
![ML Accuracy](https://img.shields.io/badge/ML%20Accuracy-98.51%25-22C55E)

> An end-to-end fitness intelligence platform that uses wristband IMU sensor data to automatically **classify barbell exercises**, **count repetitions**, **detect form quality**, and deliver **personalized AI coaching** through a stunning React dashboard.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **ML Classifier** | Random Forest model — 98.51% accuracy across 5 barbell exercises |
| 🔁 **Rep Counter** | Smoothed magnitude peak detection from accelerometer data |
| 📊 **Interactive Dashboard** | Volume trends, form scores, XP progression, personal bests |
| 🎯 **Target System** | Set weekly rep goals with live progress tracking |
| 🧠 **RAG AI Coach** | LangChain + ChromaDB + Groq LLaMA 3.1 — answers using your actual workout data |
| 🏆 **Gamification** | XP, levels, achievement badges, global leaderboard |
| 🔥 **Activity Heatmap** | 365-day GitHub-style workout frequency heatmap |
| 👥 **Cohort Comparison** | Benchmark against anonymized community averages |
| 🔐 **Admin Panel** | Full RBAC, audit logs, user management, token controls |
| 🌙 **Dark / Light Mode** | Seamless theme switching with no flash on load |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Vite · Tailwind CSS · Recharts · Framer Motion |
| **Backend** | FastAPI · SQLAlchemy · Pydantic v2 · Uvicorn |
| **Machine Learning** | scikit-learn · pandas · NumPy · SciPy · joblib |
| **AI / RAG** | LangChain · ChromaDB · HuggingFace `all-MiniLM-L6-v2` · Groq API |
| **Auth** | JWT (HS256) · bcrypt via passlib |
| **Database** | SQLite (dev) / PostgreSQL (prod) via SQLAlchemy |
| **DevOps** | Docker · Docker Compose |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ with npm
- A [Groq API Key](https://console.groq.com) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EvoFit.git
cd EvoFit
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=sqlite:///./evofit.db
JWT_SECRET=your_super_secret_key_minimum_32_chars
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Linux/macOS

# Install Python dependencies
pip install -r requirements.txt

# Initialize database and seed data
python seed_data.py
python create_admin.py         # Creates admin: evofit_admin / AdminPass_123
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Run the Application

**Terminal 1 — Backend API** (from project root, venv active):
```bash
python -m uvicorn backend.main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
# Dashboard runs at http://localhost:5173
```

---

## 📁 Project Structure

```text
EvoFit/
├── backend/                        ← FastAPI Server
│   ├── core/                       ← Global metrics & config
│   ├── database/
│   │   ├── database.py             ← SQLAlchemy engine & session
│   │   └── models.py               ← ORM table definitions
│   ├── routers/                    ← API endpoint modules
│   │   ├── admin.py                ← Admin RBAC control center
│   │   ├── body_metrics.py         ← Weight & body fat logging
│   │   ├── chat.py                 ← RAG AI Coach endpoint
│   │   ├── cohort.py               ← Community benchmarking
│   │   ├── dashboard.py            ← Summary aggregation
│   │   ├── predict.py              ← ML upload & classification
│   │   ├── sessions.py             ← Workout session history
│   │   ├── target_analysis.py      ← Target deep-dive analytics
│   │   ├── targets.py              ← Weekly rep target CRUD
│   │   ├── activity_heatmap.py     ← 365-day heatmap data
│   │   ├── achievements.py         ← Badge unlock history
│   │   └── users.py                ← Auth, profile & leaderboard
│   ├── schemas/schemas.py          ← Pydantic request/response models
│   ├── services/
│   │   ├── auth_service.py         ← JWT & bcrypt utilities
│   │   └── chat_service.py         ← LangChain RAG pipeline
│   ├── tests/test_all.py           ← PyTest integration test suite
│   └── main.py                     ← FastAPI application entry point
│
├── ml/                             ← Machine Learning Pipeline
│   ├── data_pipeline/make_dataset.py
│   ├── features/
│   │   ├── build_features.py       ← Butterworth, PCA, Fourier
│   │   └── count_repetitions.py    ← Peak detection rep counter
│   └── models/
│       └── train_model.py          ← Random Forest grid search
│
├── data/
│   ├── chroma_db/                  ← ChromaDB vector index (git-ignored)
│   ├── raw/                        ← Raw sensor CSV files
│   └── knowledge/
│       └── exercise_guides.md      ← RAG knowledge base
│
├── frontend/                       ← React Application
│   ├── src/
│   │   ├── components/             ← Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── FloatingChatbot.jsx
│   │   │   ├── CelebrationModal.jsx
│   │   │   ├── LevelCrest.jsx
│   │   │   ├── PremiumBadge.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── context/                ← Auth & notification state
│   │   ├── pages/                  ← Full page views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadPredict.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── PerformanceAnalytics.jsx
│   │   │   ├── Targets.jsx
│   │   │   ├── TrophyRoom.jsx
│   │   │   ├── SessionHistory.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── CohortComparison.jsx
│   │   │   ├── TargetAnalysis.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── NotFound.jsx
│   │   ├── index.css               ← Design system (CSS vars, animations)
│   │   └── App.jsx                 ← Router, layout, global header
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .env                            ← Secrets (git-ignored)
├── .gitignore
├── LICENSE                         ← MIT License
├── requirements.txt                ← Python dependencies
├── seed_data.py                    ← Database seeder
├── create_admin.py                 ← Admin account creator
├── run_tests.py                    ← Test suite runner
└── e2e_test.py                     ← End-to-end prediction verifier
```

---

## 🔌 API Reference

All protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/register` | Public | Register new account |
| `POST` | `/users/login` | Public | Authenticate → JWT |
| `GET` | `/users/me` | User | Full user + profile data |
| `PUT` | `/users/me/profile` | User | Update demographics |
| `PUT` | `/users/me/password` | User | Change password |
| `GET` | `/users/leaderboard` | User | Global XP leaderboard |
| `POST` | `/predict/` | User | Upload CSV → classification |
| `GET` | `/targets/` | User | List active rep targets |
| `POST` | `/targets/` | User | Create rep target |
| `GET` | `/targets/progress` | User | Live completion % |
| `GET` | `/body-metrics/` | User | List body metric history |
| `POST` | `/body-metrics/` | User | Log weight / body fat |
| `DELETE` | `/body-metrics/{id}` | User | Remove entry |
| `GET` | `/dashboard/summary` | User | Full dashboard payload |
| `GET` | `/sessions/` | User | Workout session history |
| `GET` | `/achievements/` | User | Badge unlock history |
| `GET` | `/activity-heatmap/` | User | 365-day heatmap |
| `GET` | `/cohort/comparison` | User | Community benchmarks |
| `POST` | `/chat/` | User | RAG AI Coach query |
| `GET` | `/admin/stats` | Admin | Platform-wide stats |
| `GET` | `/admin/users` | Admin | All user accounts |
| `PUT` | `/admin/users/{id}/status` | Admin | Activate / deactivate |
| `PUT` | `/admin/users/{id}/token-limit` | Admin | Set RAG token cap |
| `GET` | `/admin/audit-logs` | Admin | Admin action log |

---

## 🧪 Testing

```bash
# Run full PyTest suite (isolated DB)
python run_tests.py

# End-to-end prediction verification (requires running server)
python -m uvicorn backend.main:app &
python e2e_test.py
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services (backend + frontend + PostgreSQL)
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Research foundation: **Dave Ebbelaar, Vrije Universiteit Amsterdam** — *"Exploring the Possibilities of Context-Aware Applications for Strength Training"*
- IMU sensor dataset provided by VU Amsterdam
- AI inference powered by [Groq](https://groq.com) (LLaMA 3.1)
