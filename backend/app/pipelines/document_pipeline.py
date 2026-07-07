from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.vector_service import VectorService
from app.services.document_service import DocumentService


class DocumentPipeline:

    @staticmethod
    async def process_upload(
        db: Session,
        file: UploadFile,
        user_id,
    ):

        # Save PDF and extract text
        metadata = await PDFService.save_pdf(file)

        # Split into chunks
        chunks = ChunkService.split(
            metadata["text"]
        )

        # Save metadata to PostgreSQL
        document = DocumentService.create_document(
            db=db,
            user_id=user_id,
            metadata=metadata,
        )

        # Create FAISS index
        VectorService.create_index(
            chunks,
            document.id,
        )

        return document