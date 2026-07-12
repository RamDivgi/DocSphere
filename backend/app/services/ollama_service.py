import logging
from langchain_ollama import ChatOllama
from app.core.config import settings

logger = logging.getLogger("app.services.ollama_service")

class OllamaService:
    def __init__(self):
        self.model_name = settings.OLLAMA_MODEL
        logger.info("========== OLLAMA DEBUG ==========")
        logger.info(f"Model: {self.model_name}")
        logger.info("==================================")
        
        self.llm = ChatOllama(
            model=self.model_name,
            temperature=0.2,
        )

    def invoke(self, prompt: str):
        try:
            return self.llm.invoke(prompt)
        except Exception as e:
            logger.error(f"[OllamaService] Ollama LLM invocation failed: {e}")
            raise e

    async def astream(self, prompt: str):
        try:
            async for chunk in self.llm.astream(prompt):
                yield chunk
        except Exception as e:
            logger.error(f"[OllamaService] Ollama LLM streaming failed: {e}")
            raise e
