import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.dependencies import get_session_id
from app.models.document import Document
from app.models.conversation import Conversation

router = APIRouter()

# Base storage path
BASE_STORAGE = Path(os.getenv("STORAGE_PATH", "."))
UPLOAD_DIR = BASE_STORAGE / "uploads" / "pdfs"
VECTOR_DIR = BASE_STORAGE / "vectorstore"


@router.delete("/", status_code=status.HTTP_200_OK)
def delete_session(
    db: Session = Depends(get_db),
    session_id: uuid.UUID = Depends(get_session_id),
):
    try:
        # 1. Fetch all documents belonging to this session
        documents = db.query(Document).filter(Document.session_id == session_id).all()

        # 2. Delete actual PDF files and vectorstore folders from the filesystem
        for doc in documents:
            # Delete PDF file
            pdf_path = UPLOAD_DIR / doc.stored_filename
            if pdf_path.exists():
                try:
                    pdf_path.unlink()
                except Exception as e:
                    print(f"Error deleting PDF file {pdf_path}: {e}")

            # Delete FAISS vectorstore folder and memory cache
            vector_path = VECTOR_DIR / str(doc.id)
            if vector_path.exists():
                try:
                    shutil.rmtree(vector_path)
                except Exception as e:
                    print(f"Error deleting vectorstore folder {vector_path}: {e}")
            from app.services.vector_service import VectorService
            VectorService._INDEX_CACHE.pop(str(doc.id), None)

        # 3. Delete database rows (cascade deletes messages and conversations automatically)
        for doc in documents:
            db.delete(doc)

        # Clean up any orphan conversations that might exist for this session
        conversations = db.query(Conversation).filter(Conversation.session_id == session_id).all()
        for conv in conversations:
            db.delete(conv)

        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear session data: {str(e)}",
        )
