from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
import uuid

from app.db.dependencies import get_db
from app.core.dependencies import get_session_id

from app.services.document_service import DocumentService
from app.pipelines.document_pipeline import DocumentPipeline

router = APIRouter()


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    session_id: uuid.UUID = Depends(get_session_id),
):

    documents = DocumentService.get_documents(
        db,
        session_id,
    )

    return {
        "documents": [
            {
                "id": str(doc.id),
                "filename": doc.filename,
                "page_count": doc.page_count,
                "file_size": doc.file_size,
            }
            for doc in documents
        ]
    }


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    session_id: uuid.UUID = Depends(get_session_id),
):

    document = await DocumentPipeline.process_upload(
        db=db,
        file=file,
        session_id=session_id,
    )

    return {
        "success": True,
        "document": {
            "id": str(document.id),
            "filename": document.filename,
            "page_count": document.page_count,
            "file_size": document.file_size,
        },
    }