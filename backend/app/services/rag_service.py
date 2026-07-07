from app.services.vector_service import VectorService
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings


class RAGService:

    def __init__(self):

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )

    def ask(
        self,
        document_id,
        question,
    ):

        vector_db = VectorService.load_index(
            document_id
        )

        docs = vector_db.similarity_search(
            question,
            k=5,
        )

        context = "\n\n".join(
            doc.page_content
            for doc in docs
        )

        prompt = f"""
You are an AI assistant.

Answer ONLY from the context below.

If the answer is not present in the context, respond with: "I apologize, but I could not find the answer to your question in the uploaded document. Please feel free to ask another question or provide more details."

Context:

{context}

Question:

{question}
"""

        response = self.llm.invoke(prompt)

        return {
            "answer": response.content,
            "sources": docs,
        }