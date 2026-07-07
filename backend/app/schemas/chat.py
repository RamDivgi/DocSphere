from uuid import UUID
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    conversation_id: Optional[UUID] = None
    document_id: UUID
    question: str


class Citation(BaseModel):
    content: str
    score: float


class ConversationInfo(BaseModel):
    id: UUID
    title: str
    document_id: UUID

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseModel):
    conversation: ConversationInfo
    answer: str
    citations: list[Citation]