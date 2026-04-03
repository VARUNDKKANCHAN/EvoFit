from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import predict

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

# Include the predict router
app.include_router(predict.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the EvoFit AI API. Systems operational."}
