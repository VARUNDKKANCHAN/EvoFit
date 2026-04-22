from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.services.chat_service import chat_service
from backend.services import auth_service
from backend.database import models

router = APIRouter(
    prefix="/chat",
    tags=["AI Chatbot"]
)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest, 
    current_user: models.User = Depends(auth_service.get_current_user)
):
    """
    Send a message to the EvoFit AI Coach.
    Uses RAG to provide personalized and technical fitness advice based on 
    exercise guides and the user's workout history.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response_text = chat_service.get_chat_response(request.query, current_user.id)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
