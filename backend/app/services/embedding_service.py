from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import settings


class EmbeddingService:

    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY,
        )

    def embed_texts(self, texts: list[str]):
        return self.embeddings.embed_documents(texts)

    def embed_query(self, query: str):
        return self.embeddings.embed_query(query)