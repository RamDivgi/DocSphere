from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.dependencies import get_current_user

from app.models.user import User

from app.services.document_service import DocumentService
from app.pipelines.document_pipeline import DocumentPipeline

router = APIRouter()


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    documents = DocumentService.get_documents(
        db,
        str(current_user.id),
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
    current_user: User = Depends(get_current_user),
):

    document = await DocumentPipeline.process_upload(
        db=db,
        file=file,
        user_id=str(current_user.id),
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