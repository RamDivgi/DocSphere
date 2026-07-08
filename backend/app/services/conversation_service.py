from uuid import UUID

from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message


class ConversationService:

    @staticmethod
    def create_conversation(
        db: Session,
        session_id: UUID,
        document_id: UUID,
        title: str = "New Chat",
    ) -> Conversation:

        conversation = Conversation(
            session_id=session_id,
            document_id=document_id,
            title=title,
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_conversations(
        db: Session,
        session_id: UUID,
    ):

        return (
            db.query(Conversation)
            .filter(
                Conversation.session_id == session_id
            )
            .order_by(
                Conversation.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: UUID,
        session_id: UUID,
    ):

        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.session_id == session_id
            )
            .first()
        )

    @staticmethod
    def update_title(
        db: Session,
        conversation_id: UUID,
        title: str,
    ):

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id
            )
            .first()
        )

        if conversation:

            conversation.title = title

            db.commit()

            db.refresh(conversation)

        return conversation

    @staticmethod
    def message_count(
        db: Session,
        conversation_id: UUID,
    ) -> int:

        return (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .count()
        )

    @staticmethod
    def save_message(
        db: Session,
        conversation_id: UUID,
        role: str,
        content: str,
    ):

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: UUID,
    ):

        return (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(
                Message.created_at.asc()
            )
            .all()
        )

    @staticmethod
    def delete_conversation(
        db: Session,
        conversation_id: UUID,
    ):

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id
            )
            .first()
        )

        if conversation:

            db.delete(conversation)
            db.commit()

        return conversation