#chat_service.py
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.message import Message


class ChatService:

    @staticmethod
    def save_user_message(
        db: Session,
        conversation_id: UUID,
        question: str,
    ) -> Message:

        message = Message(
            conversation_id=conversation_id,
            role="user",
            content=question,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def save_ai_message(
        db: Session,
        conversation_id: UUID,
        answer: str,
    ) -> Message:

        message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message