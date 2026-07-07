from pathlib import Path
import os

from langchain_community.vectorstores import FAISS

from app.services.embedding_service import EmbeddingService

# Base storage path
BASE_STORAGE = Path(os.getenv("STORAGE_PATH", "."))

# Vector storage directory
VECTOR_DIR = BASE_STORAGE / "vectorstore"
VECTOR_DIR.mkdir(parents=True, exist_ok=True)


class VectorService:

    @staticmethod
    def create_index(chunks, document_id):

        embeddings = EmbeddingService()

        vector_db = FAISS.from_texts(
            texts=chunks,
            embedding=embeddings.embeddings,
        )

        vector_db.save_local(
            str(VECTOR_DIR / str(document_id))
        )

        return vector_db

    @staticmethod
    def load_index(document_id):

        embeddings = EmbeddingService()

        return FAISS.load_local(
            str(VECTOR_DIR / str(document_id)),
            embeddings.embeddings,
            allow_dangerous_deserialization=True,
        )