import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.dependencies import get_session_id
from app.db.dependencies import get_db

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    Citation,
)
from app.schemas.conversation import ConversationResponse

from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService
from app.services.document_service import DocumentService
from app.services.rag_service import RAGService

router = APIRouter()


@router.post(
    "/",
    response_model=ChatResponse,
)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    session_id: UUID = Depends(get_session_id),
):

    # ---------------------------------------
    # Create conversation only for first chat
    # ---------------------------------------

    if payload.conversation_id is None:

        # Verify document ownership
        doc = DocumentService.get_document(db, payload.document_id)
        if not doc or doc.session_id != session_id:
            raise HTTPException(
                status_code=404,
                detail="Document not found",
            )

        conversation = ConversationService.create_conversation(
            db=db,
            session_id=session_id,
            document_id=payload.document_id,
            title="New Chat",
        )

    else:

        conversation = ConversationService.get_conversation(
            db,
            payload.conversation_id,
            session_id,
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
        db=db,
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


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    session_id: UUID = Depends(get_session_id),
):
    if payload.conversation_id is None:
        doc = DocumentService.get_document(db, payload.document_id)
        if not doc or doc.session_id != session_id:
            raise HTTPException(status_code=404, detail="Document not found")

        conversation = ConversationService.create_conversation(
            db=db,
            session_id=session_id,
            document_id=payload.document_id,
            title="New Chat",
        )
    else:
        conversation = ConversationService.get_conversation(
            db,
            payload.conversation_id,
            session_id,
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

    ChatService.save_user_message(db, conversation.id, payload.question)

    async def event_generator():
        rag = RAGService()
        try:
            async for event in rag.astream_ask(str(conversation.document_id), payload.question, db=db):
                if event["stage"] == "done":
                    ChatService.save_ai_message(db, conversation.id, event["answer"])
                    if conversation.title == "New Chat":
                        updated_conv = ConversationService.update_title(db, conversation.id, payload.question[:50])
                        if updated_conv:
                            conv_dict = ConversationResponse.model_validate(updated_conv).model_dump(mode='json')
                        else:
                            conv_dict = ConversationResponse.model_validate(conversation).model_dump(mode='json')
                    else:
                        conv_dict = ConversationResponse.model_validate(conversation).model_dump(mode='json')

                    citations = [
                        Citation(content=src["page_content"][:150], score=1.0).model_dump(mode='json')
                        for src in event["sources"]
                    ]
                    yield json.dumps({
                        "stage": "done",
                        "conversation": conv_dict,
                        "answer": event["answer"],
                        "citations": citations,
                    }) + "\n"
                else:
                    yield json.dumps(event) + "\n"
        except Exception as e:
            err_msg = str(e)
            yield json.dumps({"stage": "error", "error": err_msg}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")