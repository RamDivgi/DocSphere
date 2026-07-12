from pathlib import Path
import os
import logging
import fitz
from fastapi import HTTPException
from langchain_community.vectorstores import FAISS

from app.services.embedding_service import EmbeddingService
from app.services.chunk_service import ChunkService
from app.models.document import Document
from app.db.session import SessionLocal

logger = logging.getLogger("app.services.vector_service")

# Base storage path
BASE_STORAGE = Path(os.getenv("STORAGE_PATH", "."))

# Vector storage directory
VECTOR_DIR = BASE_STORAGE / "vectorstore"
VECTOR_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = BASE_STORAGE / "uploads" / "pdfs"


class VectorService:
    # In-memory index cache for instant retrieval without reloading from disk
    _INDEX_CACHE: dict[str, FAISS] = {}

    @staticmethod
    def create_index(chunks: list[str], document_id) -> FAISS:
        doc_id_str = str(document_id)
        embeddings = EmbeddingService()

        logger.info(f"[VectorService] Building FAISS index for {doc_id_str} with {len(chunks)} chunks...")
        vector_db = FAISS.from_texts(
            texts=chunks,
            embedding=embeddings.embeddings,
        )

        # Store in fast in-memory cache
        VectorService._INDEX_CACHE[doc_id_str] = vector_db

        # Also save local file if possible
        try:
            path = VECTOR_DIR / doc_id_str
            path.mkdir(parents=True, exist_ok=True)
            vector_db.save_local(str(path))
            logger.info(f"[VectorService] FAISS index saved to disk at {path}")
        except Exception as e:
            logger.warning(f"[VectorService] Could not save index to disk (ephemeral disk?): {e}")

        return vector_db

    @staticmethod
    def load_index(document_id, db=None) -> FAISS:
        doc_id_str = str(document_id)

        # 1. Check in-memory cache first (0ms latency)
        if doc_id_str in VectorService._INDEX_CACHE:
            logger.info(f"[VectorService] Serving index for {doc_id_str} directly from IN-MEMORY cache.")
            return VectorService._INDEX_CACHE[doc_id_str]

        embeddings = EmbeddingService()
        index_path = VECTOR_DIR / doc_id_str

        # 2. Try loading from disk
        if index_path.exists() and (index_path / "index.faiss").exists():
            try:
                vector_db = FAISS.load_local(
                    str(index_path),
                    embeddings.embeddings,
                    allow_dangerous_deserialization=True,
                )
                VectorService._INDEX_CACHE[doc_id_str] = vector_db
                logger.info(f"[VectorService] Loaded FAISS index from disk and cached in memory.")
                return vector_db
            except Exception as e:
                logger.warning(f"[VectorService] Disk load failed for {doc_id_str}: {e}. Attempting auto-reconstruction...")

        # 3. Automatic reconstruction on-the-fly (Fixes Render/ephemeral filesystem crash!)
        logger.info(f"[VectorService] Index not on disk for {doc_id_str}. Reconstructing on-the-fly from database/storage...")
        session_created = False
        if db is None:
            db = SessionLocal()
            session_created = True

        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if not doc:
                raise HTTPException(
                    status_code=404,
                    detail="Document not found in database. Please upload the PDF again."
                )

            text_content = doc.content
            # If text is not in DB, try recovering from PDF on disk if available
            if not text_content or not text_content.strip():
                pdf_path = UPLOAD_DIR / doc.stored_filename
                if pdf_path.exists():
                    logger.info(f"[VectorService] Extracting text from PDF {pdf_path} to reconstruct index...")
                    try:
                        document_obj = fitz.open(pdf_path)
                        text_content = ""
                        for page in document_obj:
                            text_content += page.get_text()
                        document_obj.close()
                        if text_content.strip():
                            doc.content = text_content
                            db.commit()
                    except Exception as ex:
                        logger.error(f"[VectorService] PDF re-extraction failed: {ex}")

            if not text_content or not text_content.strip():
                raise HTTPException(
                    status_code=404,
                    detail="Document text content not available after server restart. Please re-upload the PDF."
                )

            # Re-chunk and create index
            chunks = ChunkService.split(text_content)
            vector_db = VectorService.create_index(chunks, document_id)
            return vector_db

        finally:
            if session_created and db:
                db.close()