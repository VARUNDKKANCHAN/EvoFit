# AI-Powered Full-Stack Fitness Tracking System

## 1. Abstract

Strength training is a critical component of a balanced fitness regimen, yet existing wearable technology offers little to no automated support for free-weight exercise tracking. This project proposes, designs, and implements an AI-Powered Full-Stack Fitness Tracking System — a complete web application that uses wristband accelerometer and gyroscope data to automatically classify barbell exercises, count repetitions, detect improper form, and visualize workout performance.

The machine learning core achieves 98.51% classification accuracy using a Random Forest model trained on 5 participants performing 5 fundamental barbell exercises (Bench Press, Deadlift, Overhead Press, Barbell Row, Squat). The system is extended with a modern React.js dashboard for interactive visualizations, a FastAPI backend for model serving, a target-setting module for workout goal management, and an AI chatbot powered by Retrieval-Augmented Generation (RAG) that answers personalized workout questions based on the user's actual training data.

This document provides a complete technical blueprint of the project — covering the problem background, system architecture, ML pipeline, full-stack design, RAG chatbot design, tech stack, implementation plan, and expected outcomes — in a beginner-friendly format.

## 2. Introduction & Background

### 2.1 What is this Project About?

Imagine a smartphone app that watches you lift weights and tells you: which exercise you just did, how many reps you completed, whether your form was correct, and whether you are hitting your weekly targets. That is exactly what this project builds.
The system collects motion data from a wristband sensor (just like a smartwatch), processes it through a machine learning pipeline, and presents all insights through a beautiful web dashboard. A built-in AI chatbot can answer questions like 'How many squats did I do this week?' or 'Am I improving on bench press?' — all powered by your own workout data.

### 2.2 Why is this Problem Important?

• Current fitness wearables (Fitbit, Apple Watch) track running and cycling well, but NOT free weight training.
• Personal trainers are expensive and not accessible to everyone.
• Bad exercise form causes serious injuries — especially with heavy weights.
• There is no affordable digital solution that tracks, counts, and coaches strength training automatically.
• This project fills that gap using machine learning and modern web technology.

### 2.3 Research Foundation

This project is built on the research paper:
"Exploring the Possibilities of Context-Aware Applications for Strength Training" — Dave Ebbelaar, Vrije Universiteit Amsterdam. The paper collected wristband sensor data from 5 participants performing 5 barbell exercises and trained ML models achieving 98.51% classification accuracy.

Your project extends this research by adding a full-stack web interface, target-setting, real-time visualization, and an AI chatbot on top of the ML models.

## 3. Project Objectives

### 3.1 Primary Objectives

1. Build a complete ML pipeline that classifies 5 barbell exercises from sensor data with 95%+ accuracy.
2. Implement an automatic repetition counter using peak detection algorithms.
3. Create a target-setting feature where users define weekly workout goals.
4. Develop a React.js web dashboard with interactive charts showing exercise history, rep counts, and model accuracy.
5. Build a FastAPI backend that serves ML predictions through REST API endpoints.
6. Implement an AI chatbot using RAG (Retrieval-Augmented Generation) that answers workout questions using the user's actual data.
7. Package the full application with Docker for easy deployment.

### 3.2 Secondary Objectives

• Implement form detection for bench press (correct / too high / no touch).
• Add MLflow experiment tracking to log every training run automatically.
• Create a participant comparison view showing performance across users.
• Export workout reports as downloadable PDFs.

## 4. System Overview — How Everything Connects

The system has 5 main components that work together. Here is how data flows from sensor to insight:

Sensor Data (CSV files) → ML Pipeline → FastAPI Backend → React Dashboard → User sees results + AI Chatbot answers questions

| Component          | What it Does                                            | Technology Used                  |
| ------------------ | ------------------------------------------------------- | -------------------------------- |
| Data Pipeline      | Reads CSV sensor files, cleans data, engineers features | Python, pandas, NumPy, SciPy     |
| ML Model           | Classifies exercises, counts reps, detects form errors  | scikit-learn, Random Forest      |
| Backend API        | Serves predictions, manages users, stores data          | FastAPI, PostgreSQL, JWT         |
| Frontend Dashboard | Shows charts, goals, history, chatbot UI                | React.js, Recharts, Tailwind CSS |
| AI Chatbot (RAG)   | Answers workout questions using your data               | LangChain, ChromaDB, Groq API    |
| DevOps             | Packages and deploys the whole application              | Docker, GitHub, Render           |

## 5. Machine Learning Pipeline (Detailed)

This is the core intelligence of the project. It has 5 stages.

### 5.1 Stage 1 — Data Collection (make_dataset.py)

Raw sensor data comes from MbientLab wristband sensors.
• Accelerometer at 12.5 Hz
• Gyroscope at 25 Hz
Resampled to 200ms uniform interval and saved as `01_data_processed.pkl`.

### 5.2 Stage 2 — Outlier Removal (remove_outliers.py)

Cleans data using Chauvenet's Criterion per exercise. Saved as `02_outliers_removed_chauvenets.pkl`.

### 5.3 Stage 3 — Feature Engineering (build_features.py)

• Butterworth Low-Pass Filter (cutoff 1.3Hz)
• Principal Component Analysis (PCA)
• Temporal Features (mean, std per window)
• Frequency Features (Fourier Transform)
• Clustering (K-Means k=5)

### 5.4 Stage 4 — Model Training (train_model.py)

Random Forest is the winning model with 98.51% accuracy via grid search (n_estimators=100, min_samples_leaf=2, criterion=gini).

### 5.5 Stage 5 — Repetition Counting (count_repetitions.py)

Peak detection algorithm counts reps via smoothed acceleration magnitude.

## 6. Full-Stack Application Architecture

### 6.1 Backend — FastAPI (Python)

REST API endpoints:

- POST `/predict`
- GET `/metrics`
- POST `/targets`
- GET `/targets/{user_id}`
- GET `/history/{user_id}`
- POST `/chat`
- POST `/auth/register`
- POST `/auth/login`

### 6.2 Database — PostgreSQL

Tables: `users`, `workout_sessions`, `model_results`, `targets`, `chat_history`.

### 6.3 Frontend — React.js Dashboard

Pages: Dashboard Home, Upload & Predict, Analytics, Targets & Progress, AI Chatbot.

### 6.4 Target Setting Feature

Users set weekly targets, get live progress bars, notifications, and historical reports.

## 7. AI Chatbot — Retrieval-Augmented Generation (RAG)

Personalized workout chatbot using LangChain, ChromaDB, sentence-transformers, and Groq API (LLaMA 3).

## 8. Complete Technology Stack

- **Backend & ML:** Python, FastAPI, scikit-learn, pandas, NumPy, SciPy, MLflow, joblib, PostgreSQL, SQLAlchemy, Pydantic, JWT.
- **Frontend:** React.js, Recharts, Tailwind CSS, Axios, React Router v6, React Query.
- **RAG:** LangChain, ChromaDB, HuggingFace embeddings, Groq API.
- **DevOps:** Docker, Github, Render.

## 9. Project Folder Structure

```text
evofit/
│
├── backend/                      ← FastAPI
│   ├── main.py
│   ├── routers/
│   │   └── predict.py
│   ├── services/
│   │   └── ml_service.py
│   ├── database/
│   │   ├── db.py
│   │   └── models.py
│   ├── schemas/
│   │   └── schemas.py
│   └── requirements.txt
│
├── ml/                           ← Machine Learning
│   ├── pipeline/
│   │   └── pipeline.py
│   │
│   ├── features/
│   │   ├── build_features.py
│   │   ├── remove_outliers.py
│   │   ├── count_repetitions.py
│   │   ├── DataTransformation.py
│   │   ├── FrequencyAbstraction.py
│   │   └── TemporalAbstraction.py
│   │
│   ├── models/
│   │   ├── train_model.py
│   │   ├── predict_model.py
│   │   ├── LearningAlgorithms.py
│   │   └── model.pkl
│   │
│   └── data_pipeline/
│       └── make_dataset.py
│
├── data/
│   ├── raw/
│   ├── interim/
│   └── processed/
│
├── frontend/                     ← React App
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Targets.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Chart.jsx
│   │   │   └── UploadBox.jsx
│   │   │
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   └── App.js
│   │
│   └── package.json
│
├── README.md
└── requirements.txt
```
