from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_session_id
from app.db.dependencies import get_db

from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
)
from app.schemas.message import MessageResponse

from app.services.conversation_service import ConversationService
from app.services.document_service import DocumentService

router = APIRouter()


@router.post(
    "/",
    response_model=ConversationResponse,
)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    session_id: UUID = Depends(get_session_id),
):

    # Verify document belongs to the active session
    document = DocumentService.get_document(db, payload.document_id)
    if not document or document.session_id != session_id:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return ConversationService.create_conversation(
        db=db,
        session_id=session_id,
        document_id=payload.document_id,
        title=payload.title,
    )


@router.get(
    "/",
    response_model=list[ConversationResponse],
)
def get_conversations(
    db: Session = Depends(get_db),
    session_id: UUID = Depends(get_session_id),
):

    return ConversationService.get_conversations(
        db,
        session_id,
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    session_id: UUID = Depends(get_session_id),
):

    conversation = ConversationService.get_conversation(
        db,
        conversation_id,
        session_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return ConversationService.get_messages(
        db,
        conversation_id,
    )


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    session_id: UUID = Depends(get_session_id),
):

    conversation = ConversationService.get_conversation(
        db,
        conversation_id,
        session_id,
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    ConversationService.delete_conversation(
        db,
        conversation_id,
    )

    return {
        "message": "Conversation deleted"
    }