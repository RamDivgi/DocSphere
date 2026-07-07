from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db

from app.models.user import User

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    Citation,
)

from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService
from app.services.rag_service import RAGService

router = APIRouter()


@router.post(
    "/",
    response_model=ChatResponse,
)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # ---------------------------------------
    # Create conversation only for first chat
    # ---------------------------------------

    if payload.conversation_id is None:

        conversation = ConversationService.create_conversation(
            db=db,
            user_id=current_user.id,
            document_id=payload.document_id,
            title="New Chat",
        )

    else:

        conversation = ConversationService.get_conversation(
            db,
            payload.conversation_id,
        )

        if not conversation:

            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )

    # ---------------------------
    # Save User Message
    # ---------------------------

    ChatService.save_user_message(
        db,
        conversation.id,
        payload.question,
    )

    # ---------------------------
    # Ask RAG
    # ---------------------------

    rag = RAGService()

    result = rag.ask(
        str(conversation.document_id),
        payload.question,
    )

    # ---------------------------
    # Save AI Message
    # ---------------------------

    ChatService.save_ai_message(
        db,
        conversation.id,
        result["answer"],
    )

    # ---------------------------
    # Rename only once
    # ---------------------------

    if conversation.title == "New Chat":

        conversation = ConversationService.update_title(
            db,
            conversation.id,
            payload.question[:50],
        )

    citations = []

    for doc in result["sources"]:

        citations.append(
            Citation(
                content=doc.page_content[:150],
                score=1.0,
            )
        )

    return ChatResponse(
    conversation=conversation,
    answer=result["answer"],
    citations=citations,
)