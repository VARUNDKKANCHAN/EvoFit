from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import predict, targets, users, dashboard, achievements, sessions, chat, target_analysis
from backend.database.database import engine, Base
import backend.database.models as models

app = FastAPI(
    title="EvoFit API",
    description="API for AI-Powered Full-Stack Fitness Tracking System",
    version="1.0.0"
)

# Configure CORS to allow our React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. In production, restrict to your frontend domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create all database tables on startup if they don't exist
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(predict.router)
app.include_router(targets.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(achievements.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(target_analysis.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the EvoFit AI API. Systems operational."}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
