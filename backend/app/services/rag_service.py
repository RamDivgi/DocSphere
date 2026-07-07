import logging
from app.services.vector_service import VectorService
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

logger = logging.getLogger("app.services.rag_service")


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
        logger.info(f"--- RAG Query Pipeline Started for document_id: {document_id} ---")
        logger.info(f"[Query] User Question: '{question}'")

        # 1. Load FAISS index
        try:
            vector_db = VectorService.load_index(document_id)
            logger.info(f"[Query] FAISS index loaded. Total vectors: {vector_db.index.ntotal}")
        except Exception as e:
            logger.error(f"[Query] Failed to load FAISS index: {e}")
            raise e

        # 2. Retrieve similarity scores for logging purposes
        try:
            candidates_with_scores = vector_db.similarity_search_with_score(question, k=5)
            logger.info(f"[Query] Candidate chunks retrieved with L2 distance scores (lower is closer):")
            for idx, (doc, score) in enumerate(candidates_with_scores):
                logger.info(f"  Candidate {idx}: Score = {score:.4f} | Content snippet: {doc.page_content[:150].strip()}...")
        except Exception as e:
            logger.warning(f"[Query] Failed to get similarity scores: {e}")

        # 3. Retrieve final chunks using Maximal Marginal Relevance (MMR) for optimal diversity & coverage
        try:
            docs = vector_db.max_marginal_relevance_search(
                question,
                k=5,
                fetch_k=20,
            )
            logger.info(f"[Query] MMR retrieval selected {len(docs)} chunks.")
            for idx, doc in enumerate(docs):
                logger.info(f"  MMR Chunk {idx}: {doc.page_content[:150].strip()}...")
        except Exception as e:
            logger.error(f"[Query] MMR search failed: {e}")
            raise e

        # 4. Construct context and prompt
        context = "\n\n".join(
            doc.page_content
            for doc in docs
        )

        prompt = f"""You are a helpful and professional AI research assistant.

Use ONLY the provided context below to answer the user's question. 

Guidelines:
1. Ground your answer strictly on the facts directly mentioned in the context. Do not extrapolate, assume, or invent details.
2. If the context does not contain enough information to answer the question, or if the question is unrelated to the context, respond exactly with: "I apologize, but I could not find the answer to your question in the uploaded document. Please feel free to ask another question or provide more details."
3. Keep the tone professional, objective, and helpful.

Context:
{context}

Question:
{question}
"""
        logger.info(f"[Query] Prompt constructed. Length: {len(prompt)} characters.")

        # 5. Invoke Gemini LLM
        try:
            response = self.llm.invoke(prompt)
            logger.info("[Query] Gemini LLM invocation successful.")
            logger.info(f"[Query] Gemini Raw Response:\n{response.content}")
            logger.info("--- RAG Query Pipeline Completed Successfully ---")
        except Exception as e:
            logger.error(f"[Query] Gemini LLM invocation failed: {e}")
            raise e

        return {
            "answer": response.content,
            "sources": docs,
        }