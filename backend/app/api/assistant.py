from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.database import User, Farm, ChatMessage
from app.schemas.schemas import AssistantChatRequest, AssistantChatResponse
from app.services.rag_service import rag_service
from app.api.auth import get_current_user

router = APIRouter(prefix="/assistant", tags=["Agricultural RAG Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
def chat_with_assistant(
    chat_req: AssistantChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    RAG-grounded agricultural chat assistant answering in Marathi, Hindi, or English.
    Retrieves trusted university and government agronomic documents, returning verified source citations.
    """
    # 1. Fetch farmer's farm profile context if available
    farm_context = None
    if chat_req.farm_id:
        farm = db.query(Farm).filter(Farm.id == chat_req.farm_id).first()
    else:
        farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()

    if farm:
        farm_context = {
            "farm_name": farm.farm_name,
            "location": farm.location,
            "primary_crop": farm.primary_crop,
            "crop_stage": farm.crop_stage,
            "soil_type": farm.soil_type,
            "irrigation_method": farm.irrigation_method
        }

    # 2. Record user query in chat history
    user_msg_record = ChatMessage(
        user_id=current_user.id,
        session_id=chat_req.session_id or "default",
        sender="user",
        message=chat_req.message,
        language=chat_req.language or current_user.preferred_language
    )
    db.add(user_msg_record)
    db.commit()

    # 3. Execute RAG generation with source extraction
    rag_result = rag_service.generate_response(
        query=chat_req.message,
        user_language=chat_req.language or current_user.preferred_language,
        farm_context=farm_context
    )

    # 4. Save assistant response
    asst_msg_record = ChatMessage(
        user_id=current_user.id,
        session_id=chat_req.session_id or "default",
        sender="assistant",
        message=rag_result["message"],
        language=rag_result["detected_language"],
        sources=rag_result["sources"],
        confidence=rag_result["confidence"]
    )
    db.add(asst_msg_record)
    db.commit()

    return rag_result

@router.get("/history")
def get_chat_history(
    session_id: str = "default",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Retrieve chat history for the active session."""
    chats = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": c.id,
            "sender": c.sender,
            "message": c.message,
            "language": c.language,
            "sources": c.sources or [],
            "created_at": c.created_at.strftime("%I:%M %p") if c.created_at else ""
        }
        for c in chats
    ]
