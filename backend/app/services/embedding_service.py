import logging
import time

from langchain_cohere import CohereEmbeddings
from app.core.config import settings

logger = logging.getLogger("app.services.embedding_service")


class EmbeddingService:

    def __init__(self):
        self.embeddings = CohereEmbeddings(
            model="embed-v4.0",
            cohere_api_key=settings.COHERE_API_KEY,
        )

    def embed_texts(self, texts: list[str]):
        max_retries = 3

        for attempt in range(max_retries):
            try:
                return self.embeddings.embed_documents(texts)

            except Exception as e:
                err = str(e).lower()

                if (
                    "429" in err
                    or "rate limit" in err
                    or "too many requests" in err
                ):
                    if attempt < max_retries - 1:
                        wait = 2 ** attempt
                        logger.warning(
                            f"[EmbeddingService] Cohere rate limited. Retrying in {wait}s..."
                        )
                        time.sleep(wait)
                        continue

                logger.error(f"[EmbeddingService] Embedding failed: {e}")
                raise

    def embed_query(self, query: str):
        max_retries = 3

        for attempt in range(max_retries):
            try:
                return self.embeddings.embed_query(query)

            except Exception as e:
                err = str(e).lower()

                if (
                    "429" in err
                    or "rate limit" in err
                    or "too many requests" in err
                ):
                    if attempt < max_retries - 1:
                        wait = 2 ** attempt
                        logger.warning(
                            f"[EmbeddingService] Cohere rate limited. Retrying in {wait}s..."
                        )
                        time.sleep(wait)
                        continue

                logger.error(f"[EmbeddingService] Query embedding failed: {e}")
                raise