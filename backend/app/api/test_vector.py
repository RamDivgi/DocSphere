from fastapi import APIRouter

from app.services.chunk_service import ChunkService
from app.services.vector_service import VectorService

router = APIRouter()


@router.get("/vector")

def test_vector():

    text = """
    Artificial Intelligence is transforming healthcare.
    Machine Learning helps detect diseases.
    Deep Learning is useful for medical imaging.
    Retrieval-Augmented Generation improves LLM accuracy.
    """

    chunks = ChunkService.split(text)

    db = VectorService.create_index(
        chunks,
        "demo"
    )

    results = db.similarity_search(
        "What is RAG?",
        k=2
    )

    return {
        "chunks": len(chunks),
        "results": [
            r.page_content
            for r in results
        ],
    }