from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import (
    predict, targets, users, dashboard, achievements,
    sessions, chat, target_analysis, activity_heatmap,
    admin, cohort, body_metrics
)
from backend.database.database import engine, Base
import backend.database.models as models


# ── Lifespan: replaces deprecated @app.on_event("startup") ──────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create all DB tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: nothing to clean up for SQLite; add connection pool teardown here
    # if migrating to PostgreSQL with asyncpg.


app = FastAPI(
    title="EvoFit API",
    description="API for AI-Powered Full-Stack Fitness Tracking System",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error-rate tracker middleware ─────────────────────────────────────
from backend.core.metrics import GLOBAL_METRICS

@app.middleware("http")
async def track_errors(request: Request, call_next):
    try:
        response = await call_next(request)
        if response.status_code >= 500:
            GLOBAL_METRICS.increment_error()
        return response
    except Exception as e:
        GLOBAL_METRICS.increment_error()
        raise e

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(targets.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(achievements.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(target_analysis.router)
app.include_router(activity_heatmap.router)
app.include_router(admin.router)
app.include_router(cohort.router)
app.include_router(body_metrics.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the EvoFit AI API. Systems operational."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
