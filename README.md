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
| 📊 **Interactive Dashboard** | Volume trends, form scores, XP progression, personal bests, workout streaks |
| 🎯 **Target System** | Set weekly rep goals with live progress tracking and completion toasts |
| 🧠 **RAG AI Coach** | LangChain + ChromaDB + Groq LLaMA 3.1 — answers using your actual workout data |
| 🏆 **Gamification** | XP, tiered levels, achievement badges, global leaderboard with percentile ranking |
| 🔥 **Activity Heatmap** | 365-day GitHub-style workout frequency heatmap |
| 👥 **Cohort Comparison** | Benchmark your form and volume against anonymized community averages |
| 📐 **Body Metrics** | Log and trend weight & body fat percentage over time |
| 🔐 **Admin Panel** | Full RBAC, audit logs, user management, RAG token controls, system health |
| 🌙 **Dark / Light Mode** | Seamless theme switching with no flash on load |
| 🛡️ **Security** | bcrypt password hashing, strict complexity validation, rate limiting |

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

# Initialize the database and seed mock data
python seed_data.py

# Create default admin account (username: evofit_admin / password: AdminPass_123)
python create_admin.py
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
# Interactive Swagger docs at http://localhost:8000/docs
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
│   │   ├── dashboard.py            ← Summary & streak aggregation
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
│   │   │   ├── AuthPage.jsx        ← Login & registration
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadPredict.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Targets.jsx
│   │   │   ├── TrophyRoom.jsx
│   │   │   ├── SessionHistory.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── CohortComparison.jsx
│   │   │   ├── TargetAnalysis.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── NotFound.jsx        ← Custom 404 page
│   │   ├── index.css               ← Design system (CSS vars, animations)
│   │   └── App.jsx                 ← Router, layout, global header
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .env                            ← Secrets (git-ignored)
├── .gitignore
├── LICENSE                         ← MIT License
├── PROJECT_DOCUMENTATION.md        ← Full technical documentation
├── requirements.txt                ← Python dependencies
├── seed_data.py                    ← Database seeder
├── create_admin.py                 ← Admin account creator
├── run_tests.py                    ← Test suite runner
└── e2e_test.py                     ← End-to-end prediction verifier
```

---

## 🔌 API Reference

All protected endpoints require `Authorization: Bearer <token>`.

### User & Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/register` | Public | Register new account |
| `POST` | `/users/login` | Public | Authenticate → JWT |
| `GET` | `/users/me` | User | Full user + profile data |
| `PUT` | `/users/me/profile` | User | Update demographics |
| `PUT` | `/users/me/password` | User | Change password |
| `GET` | `/users/leaderboard` | User | Global XP leaderboard with percentile |

### Workouts & ML

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/predict/` | User | Upload CSV → ML classification + XP |
| `GET` | `/predict/metrics` | Public | ML accuracy, confusion matrix |
| `GET` | `/sessions/` | User | Workout session history |
| `GET` | `/dashboard/summary` | User | Full dashboard payload |
| `GET` | `/activity-heatmap/` | User | 365-day heatmap |

### Targets & Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/targets/` | User | List active rep targets |
| `POST` | `/targets/` | User | Create rep target |
| `DELETE` | `/targets/{id}` | User | Delete target |
| `GET` | `/targets/progress` | User | Live completion % |
| `GET` | `/cohort/comparison` | User | Community benchmarks |

### Body Metrics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/body-metrics/` | User | List body metric history |
| `POST` | `/body-metrics/` | User | Log weight / body fat |
| `DELETE` | `/body-metrics/{id}` | User | Remove entry |

### Achievements & AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/achievements/` | User | Badge unlock history |
| `POST` | `/chat/` | User | RAG AI Coach query |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | Platform-wide stats |
| `GET` | `/admin/users` | Admin | All user accounts |
| `PUT` | `/admin/users/{id}/status` | Admin | Activate / deactivate |
| `PUT` | `/admin/users/{id}/token-limit` | Admin | Set RAG token cap |
| `GET` | `/admin/audit-logs` | Admin | Admin action log |
| `GET` | `/admin/system-status` | Admin | Live system health check |
| `POST` | `/admin/system/flush-cache` | Admin | Reset in-memory metrics |

---

## 🤖 Machine Learning Pipeline

The ML pipeline transforms raw 6-axis IMU sensor streams into exercise labels, rep counts, and form scores across 5 stages:

| Stage | Script | Key Technique |
|---|---|---|
| **1. Data Collection** | `make_dataset.py` | Resample to 200ms uniform intervals |
| **2. Outlier Removal** | `remove_outliers.py` | Chauvenet's Criterion per exercise class |
| **3. Feature Engineering** | `build_features.py` | Butterworth filter, PCA, Fourier, K-Means |
| **4. Model Training** | `train_model.py` | Random Forest via Grid Search CV |
| **5. Rep Counting** | `count_repetitions.py` | Smoothed magnitude peak detection |

**Model Performance:**

| Metric | Value |
|---|---|
| Algorithm | Random Forest (scikit-learn) |
| Hyperparameters | `n_estimators=100`, `min_samples_leaf=2`, `criterion=gini` |
| Accuracy | **98.51%** |
| Classes | `bench`, `dead`, `ohp`, `row`, `squat` |
| Input | Accelerometer (x,y,z) + Gyroscope (x,y,z) + PCA + Fourier coefficients |

---

## 🧠 RAG AI Coach Architecture

The RAG Coach combines static authoritative knowledge with dynamic user physiological logs to minimize hallucinations and deliver hyper-personalized advice:

1. **Vector Store**: `exercise_guides.md` is chunked and embedded with `all-MiniLM-L6-v2` → stored in ChromaDB.
2. **Dynamic Context**: At query time, the system injects your profile, last 5 sessions, active targets, and the top-3 semantic guide chunks into the prompt.
3. **48-Hour Recovery Engine**: Aggregates your rep volume per muscle group over the past 48 hours. Groups exceeding **40 reps** are flagged as *Recovering* — the coach proactively suggests fresh muscle focuses.
4. **Token Safety**: Each user has a configurable `rag_token_limit` (default 50,000). Admin-adjustable. Requests exceeding the cap are blocked.
5. **LLM**: Groq `llama-3.1-8b-instant` for ultra-fast, high-quality responses.

---

## 🔐 Security

| Measure | Implementation |
|---|---|
| Password Hashing | `bcrypt` via `passlib[bcrypt]` |
| Password Policy | Min 8 chars · 1 uppercase · 1 lowercase · 1 digit · 1 special char |
| Auth Tokens | JWT HS256 · configurable expiry (default 60 min) |
| Access Control | Two-tier RBAC — `is_admin` flag enforced on every protected route |
| SQL Injection | SQLAlchemy ORM parameterized queries throughout |
| Secrets | `.env` file git-ignored; never committed to source control |

---

## 🧪 Testing

```bash
# Run full PyTest suite (isolated DB, no external API calls)
python run_tests.py

# End-to-end prediction verification (requires running server)
python -m uvicorn backend.main:app &
python e2e_test.py
```

**Test coverage includes:**
- Password complexity & bcrypt hashing
- JWT generation, expiry & RBAC enforcement
- Admin-only endpoint access control (403 on regular user access)
- Target CRUD and live progress calculation
- RAG token counter (mocked — no paid API tokens consumed)
- End-to-end CSV upload → ML prediction → XP award pipeline

---

## 🐳 Docker Deployment

```bash
# Build and start all services (backend + frontend + PostgreSQL)
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

For production, set `DATABASE_URL` to your PostgreSQL connection string and pass secrets via environment variables or Docker secrets.

---

## 🌐 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `sqlite:///./evofit.db` | SQLAlchemy connection string |
| `JWT_SECRET` | ✅ | *(none)* | Secret key for JWT signing (32+ chars) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | `60` | JWT lifetime in minutes |
| `GROQ_API_KEY` | ✅ | *(none)* | Groq cloud LLM API key |
| `GROQ_MODEL` | ❌ | `llama-3.1-8b-instant` | Groq model identifier |
| `CHROMA_DB_DIR` | ❌ | `data/chroma_db/` | ChromaDB persistence path |
| `KNOWLEDGE_FILE` | ❌ | `data/knowledge/exercise_guides.md` | RAG knowledge base path |
| `RAG_DEFAULT_TOKEN_LIMIT` | ❌ | `50000` | Default per-user RAG token cap |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Research foundation: **Dave Ebbelaar, Vrije Universiteit Amsterdam** — *"Exploring the Possibilities of Context-Aware Applications for Strength Training"*
- IMU sensor dataset provided by VU Amsterdam
- AI inference powered by [Groq](https://groq.com) (LLaMA 3.1)

---

*For full technical documentation including architecture diagrams, database schema, sequence diagrams, and deployment guides, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).*
