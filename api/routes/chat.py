# apps/api/routes/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
from src.agents.runner import run_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(req: ChatRequest):
    response = await run_agent(req.message)
    return {"response": response} 