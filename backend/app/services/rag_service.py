import logging
import os
import time
from app.services.vector_service import VectorService
from app.services.llm_factory import LLMFactory
import asyncio
logger = logging.getLogger("app.services.rag_service")


class RAGService:

    def __init__(self):
        self.llm_factory = LLMFactory()

    def ask(
        self,
        document_id,
        question,
        db=None,
    ):
        logger.info(f"--- RAG Query Pipeline Started for document_id: {document_id} ---")
        logger.info(f"[Query] User Question: '{question}'")

        # 1. Load FAISS index (with DB fallback for ephemeral storage recovery)
        try:
            vector_db = VectorService.load_index(document_id, db=db)
            logger.info(f"[Query] FAISS index loaded. Total vectors: {vector_db.index.ntotal}")
        except Exception as e:
            logger.error(f"[Query] Failed to load FAISS index: {e}")
            raise e

        # 2. Retrieve similarity scores for logging purposes
        try:
            candidates_with_scores = vector_db.similarity_search_with_score(question, k=4)
            logger.info(f"[Query] Candidate chunks retrieved with L2 distance scores (lower is closer):")
            for idx, (doc, score) in enumerate(candidates_with_scores):
                logger.info(f"  Candidate {idx}: Score = {score:.4f} | Content snippet: {doc.page_content[:150].strip()}...")
        except Exception as e:
            logger.warning(f"[Query] Failed to get similarity scores: {e}")

        # 3. Retrieve final chunks using Maximal Marginal Relevance (MMR)
        try:
            docs = vector_db.max_marginal_relevance_search(
                question,
                k=4,
                fetch_k=15,
            )
            logger.info(f"[Query] MMR retrieval selected {len(docs)} chunks.")
            for idx, doc in enumerate(docs):
                logger.info(f"  MMR Chunk {idx}: {doc.page_content[:150].strip()}...")
        except Exception as e:
            logger.error(f"[Query] MMR search failed: {e}")
            raise e

        # 4. Construct context and prompt
        context = "\n\n".join(
            f"[{idx+1}] {doc.page_content}"
            for idx, doc in enumerate(docs)
        )

        prompt = f"""You are a helpful and professional AI research assistant.

Determine how to answer the user's question based on the following classification:

Case 1: Document-Specific Questions
If the question is about specific details, facts, or information that should be present in the uploaded document:
- Ground your answer strictly on the facts directly mentioned in the Context.
- Do not extrapolate or invent details.
- **IMPORTANT**: When using information from the Context, you MUST cite the source by appending the context chunk number at the end of the sentence or claim, exactly like `[1]` or `[2]`.
- If the requested information is genuinely absent or cannot be found in the Context, respond EXACTLY with: "I apologize, but I could not find the answer to your question in the uploaded document. Please feel free to ask another question or provide more details."

Case 2: General Knowledge Questions
If the question is about general concepts, tools, definitions, or general knowledge:
- Use your own internal general knowledge to answer the question naturally.
- You MUST begin your response with exactly: "Based on general knowledge (not the uploaded document):" followed by the natural answer.

Case 3: Hybrid Questions
If the question mixes or combines information requested from the document with general knowledge:
- Retrieve the relevant facts/information from the document context. CITE your sources from the context using `[1]`, `[2]`, etc.
- Use your own general knowledge to explain, expand on, or answer the rest of the question naturally.
- Combine both sources of information seamlessly. Do NOT start with the general knowledge prefix for hybrid questions.

Context:
{context}

Question:
{question}
"""
        logger.info(f"[Query] Prompt constructed. Length: {len(prompt)} characters.")

        # 5. Invoke LLM Factory
        response = self.llm_factory.invoke(prompt)
        logger.info("[Query] LLM invocation successful.")
        logger.info(f"[Query] Raw Response:\n{response.content}")
        logger.info("--- RAG Query Pipeline Completed Successfully ---")

        ans_content = response.content
        ans_strip = ans_content.strip()

        # Check if the response is based on general knowledge or if it's the fallback missing info response
        if (
            ans_strip.startswith("Based on general knowledge (not the uploaded document):")
            or ans_strip.startswith("I apologize, but I could not find")
        ):
            returned_docs = []
        else:
            returned_docs = docs

        return {
            "answer": ans_content,
            "sources": returned_docs,
        }

    async def astream_ask(
        self,
        document_id,
        question,
        db=None,
    ):
        logger.info(f"--- RAG Streaming Pipeline Started for document_id: {document_id} ---")
        
        # 1. Fast Intent Routing
        yield {"stage": "thinking", "message": "🤔 Analyzing query..."}
        
        router_prompt = f"""Classify the following user message into one of two categories:
1. DOCUMENT: The user is asking a question that requires searching the uploaded document (e.g. specific facts, resume details, summaries, "what does this document say").
2. CONVERSATION: The user is saying a casual greeting (hi, hello, thanks), or asking for general knowledge, coding help, or suggestions that don't strictly require the uploaded document.

User Message: {question}

Reply with EXACTLY ONE word: DOCUMENT or CONVERSATION."""
        
        try:
            route_res = self.llm_factory.invoke(router_prompt)
            intent = route_res.content.strip().upper()
            logger.info(f"[Router] Intent classified as: {intent}")
        except Exception as e:
            logger.warning(f"[Router] Routing failed, defaulting to DOCUMENT: {e}")
            intent = "DOCUMENT"
            
        docs = []
        if "DOCUMENT" in intent:
            yield {"stage": "reading", "message": "📄 Reading document..."}
            vector_db = VectorService.load_index(document_id, db=db)
            
            yield {"stage": "retrieving", "message": "🔍 Searching document..."}
            docs = vector_db.max_marginal_relevance_search(
                question,
                k=4,
                fetch_k=15,
            )
            context = "\n\n".join(f"[{idx+1}] {doc.page_content}" for idx, doc in enumerate(docs))
        else:
            context = "No document context needed for this query. Reply naturally."

        yield {"stage": "generating", "message": "🤖 Generating answer..."}
        prompt = f"""You are a helpful and professional AI research assistant.

Determine how to answer the user's question based on the following classification:

Case 1: Document-Specific Questions
If the question is about specific details, facts, or information that should be present in the uploaded document:
- Ground your answer strictly on the facts directly mentioned in the Context.
- Do not extrapolate or invent details.
- **IMPORTANT**: When using information from the Context, you MUST cite the source by appending the context chunk number at the end of the sentence or claim, exactly like `[1]` or `[2]`.
- If the requested information is genuinely absent or cannot be found in the Context, respond EXACTLY with: "I apologize, but I could not find the answer to your question in the uploaded document. Please feel free to ask another question or provide more details."

Case 2: General Knowledge Questions
If the question is about general concepts, tools, definitions, or general knowledge:
- Use your own internal general knowledge to answer the question naturally.
- You MUST begin your response with exactly: "Based on general knowledge (not the uploaded document):" followed by the natural answer.

Case 3: Hybrid Questions
If the question mixes or combines information requested from the document with general knowledge:
- Retrieve the relevant facts/information from the document context. CITE your sources from the context using `[1]`, `[2]`, etc.
- Use your own general knowledge to explain, expand on, or answer the rest of the question naturally.
- Combine both sources of information seamlessly. Do NOT start with the general knowledge prefix for hybrid questions.

Context:
{context}

Question:
{question}
"""
        # Stream response chunks
        
        tokens = []

        try:
            async for chunk in self.llm_factory.astream(prompt):
                if not chunk.content:
                    continue

                if isinstance(chunk.content, str):
                    text = chunk.content
                elif isinstance(chunk.content, list):
                    parts = []
                    for item in chunk.content:
                        if isinstance(item, str):
                            parts.append(item)
                        elif isinstance(item, dict):
                            parts.append(item.get("text", ""))
                        else:
                            parts.append(str(item))
                    text = "".join(parts)
                else:
                    text = str(chunk.content)

                tokens.append(text)
                yield {
                    "stage": "token",
                    "token": text,
                }
        except Exception as e:
            logger.error(f"[Streaming] LLM streaming failed: {e}")
            raise e

        ans_content = "".join(map(str, tokens))
        ans_strip = ans_content.strip()

        if (
            ans_strip.startswith("Based on general knowledge (not the uploaded document):")
            or ans_strip.startswith("I apologize, but I could not find")
        ):
            returned_docs = []
        else:
            returned_docs = docs

        yield {
            "stage": "done",
            "answer": ans_content,
            "sources": [
                {"page_content": doc.page_content, "metadata": doc.metadata}
                for doc in returned_docs
            ]
        }