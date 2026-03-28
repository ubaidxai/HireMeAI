# apps/api/routes/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from src.agents.runner import run_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(req: ChatRequest):
    response = run_agent(req.message)
    return {"response": response} 