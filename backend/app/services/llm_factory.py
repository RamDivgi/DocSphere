import logging
from app.core.config import settings
from app.services.gemini_service import GeminiService
from app.services.ollama_service import OllamaService

logger = logging.getLogger("app.services.llm_factory")

class LLMFactory:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_service = GeminiService()
        self.ollama_service = OllamaService()

    def invoke(self, prompt: str):
        if self.provider == "ollama":
            logger.info("Provider: Ollama")
            return self.ollama_service.invoke(prompt)
        
        # Default or "auto" or "gemini" goes to Gemini first
        try:
            res = self.gemini_service.invoke(prompt)
            logger.info("Provider: Gemini")
            return res
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "503" in err_str or "exhausted" in err_str or "unavailable" in err_str or "timeout" in err_str or "connectionerror" in err_str or "404" in err_str or "not_found" in err_str:
                logger.warning(f"Gemini failed with error: {e}. Falling back to Ollama.")
                logger.info("Provider: Ollama (fallback)")
                return self.ollama_service.invoke(prompt)
            else:
                logger.error(f"Gemini failed with unrecoverable error: {e}")
                raise e

    async def astream(self, prompt: str):
        if self.provider == "ollama":
            logger.info("Provider: Ollama")
            async for chunk in self.ollama_service.astream(prompt):
                yield chunk
            return

        # Default or "auto" or "gemini" goes to Gemini first
        try:
            # Note: We must consume the generator to catch errors early if possible,
            # but standard astream yields as it goes.
            # If the first chunk fails, we can catch it.
            # If it fails in the middle of streaming, we can't easily fallback and restart,
            # but usually connection errors happen before the first chunk.
            
            gemini_gen = self.gemini_service.astream(prompt)
            
            # Try to get the first chunk to catch immediate errors
            first_chunk = await anext(gemini_gen)
            
            logger.info("Provider: Gemini")
            yield first_chunk
            
            async for chunk in gemini_gen:
                yield chunk
                
        except Exception as e:
            err_str = str(e).lower()
            if "429" in err_str or "503" in err_str or "exhausted" in err_str or "unavailable" in err_str or "timeout" in err_str or "connectionerror" in err_str or "404" in err_str or "not_found" in err_str:
                logger.warning(f"Gemini failed with error: {e}. Falling back to Ollama.")
                logger.info("Provider: Ollama (fallback)")
                
                async for chunk in self.ollama_service.astream(prompt):
                    yield chunk
            else:
                logger.error(f"Gemini failed with unrecoverable error: {e}")
                raise e
