from pathlib import Path

from langchain_community.vectorstores import FAISS

from app.services.embedding_service import EmbeddingService

VECTOR_DIR = Path("vectorstore")
VECTOR_DIR.mkdir(exist_ok=True)


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