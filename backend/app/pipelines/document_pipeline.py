from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.vector_service import VectorService
from app.services.document_service import DocumentService
from app.models.document import Document

import logging

logger = logging.getLogger("app.pipelines.document_pipeline")


class DocumentPipeline:

    @staticmethod
    async def process_upload(
        db: Session,
        file: UploadFile,
        session_id,
    ):
        logger.info(f"--- RAG Ingestion Pipeline Started for file: {file.filename} ---")

        # Read content once to check for duplicate before expensive extraction & embedding
        content = await file.read()
        file_size = len(content)
        await file.seek(0)

        existing = (
            db.query(Document)
            .filter(
                Document.session_id == session_id,
                Document.filename == file.filename,
                Document.file_size == file_size,
            )
            .first()
        )

        if existing:
            logger.info(f"[Ingestion] Document '{file.filename}' (size: {file_size}) already exists for session (ID: {existing.id}). Skipping duplicate extraction & embedding!")
            return existing

        # Save PDF and extract text
        metadata = await PDFService.save_pdf(file)
        logger.info(f"[Ingestion] PDF text extracted successfully. Character count: {len(metadata['text'])}")

        # Split into chunks
        chunks = ChunkService.split(
            metadata["text"]
        )
        logger.info(f"[Ingestion] Text split into {len(chunks)} chunks.")

        # Save metadata to PostgreSQL
        document = DocumentService.create_document(
            db=db,
            session_id=session_id,
            metadata=metadata,
        )
        logger.info(f"[Ingestion] PostgreSQL document record created. ID: {document.id}")

        # Create FAISS index
        vector_db = VectorService.create_index(
            chunks,
            document.id,
        )
        logger.info(f"[Ingestion] FAISS index created successfully. Total vectors stored: {vector_db.index.ntotal}")
        logger.info(f"--- RAG Ingestion Pipeline Completed Successfully ---")

        return document