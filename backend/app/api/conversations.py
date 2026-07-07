from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.dependencies import get_db

from app.models.user import User

from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
)
from app.schemas.message import MessageResponse

from app.services.conversation_service import ConversationService

router = APIRouter()


@router.post(
    "/",
    response_model=ConversationResponse,
)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return ConversationService.create_conversation(
        db=db,
        user_id=current_user.id,
        document_id=payload.document_id,
        title=payload.title,
    )


@router.get(
    "/",
    response_model=list[ConversationResponse],
)
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return ConversationService.get_conversations(
        db,
        current_user.id,
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    conversation = ConversationService.get_conversation(
        db,
        conversation_id,
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
    current_user: User = Depends(get_current_user),
):

    ConversationService.delete_conversation(
        db,
        conversation_id,
    )

    return {
        "message": "Conversation deleted"
    }