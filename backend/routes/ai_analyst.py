from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from database.session import get_session
from src.services.ai_analyst_service import ai_analyst_service

router = APIRouter(prefix="/ai")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    message: str


@router.post("/chat", response_model=ChatResponse, summary="Chat with the AI Analyst")
def chat(data: ChatRequest, session: Session = Depends(get_session)) -> ChatResponse:
    message = data.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message cannot be empty"
        )

    try:
        reply = ai_analyst_service.chat(message, session)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        ) from exc

    return ChatResponse(message=reply)
