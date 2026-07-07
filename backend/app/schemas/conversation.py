from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ConversationCreate(BaseModel):
    title: str
    document_id: UUID


class ConversationResponse(BaseModel):
    id: UUID
    title: str
    document_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True