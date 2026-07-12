import logging
import os
import time
import hashlib
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

logger = logging.getLogger("app.services.gemini_service")


class GeminiService:
    def __init__(self):
        self.model_name = settings.GEMINI_CHAT_MODEL
        logger.info("========== GEMINI DEBUG ==========")
        logger.info(f"Model: {self.model_name}")
        logger.info(
            f"API Key Hash: {hashlib.sha256(settings.GEMINI_API_KEY.encode()).hexdigest()[:12]}"
        )
        logger.info("==================================")

        self.llm = ChatGoogleGenerativeAI(
            model=self.model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            timeout=30,
        )

    def _get_fallback_llm(self, model_alias: str):
        return ChatGoogleGenerativeAI(
            model=model_alias,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            timeout=30,
        )

    def invoke(self, prompt: str):
        max_retries = 3
        current_llm = self.llm
        fallbacks = [
            "models/gemini-flash-latest",
            "models/gemini-2.0-flash",
        ]

        for attempt in range(max_retries):
            try:
                return current_llm.invoke(prompt)
            except Exception as e:
                err_str = str(e).lower()
                if "429" in err_str or "exhausted" in err_str or "quota" in err_str or "503" in err_str or "unavailable" in err_str or "timeout" in err_str or "connectionerror" in err_str:
                    if attempt < max_retries - 1:
                        sleep_time = 0.5 * (attempt + 1)
                        logger.warning(f"[GeminiService] Rate limit/Error hit. Retrying in {sleep_time}s...")
                        time.sleep(sleep_time)
                        continue
                    else:
                        raise e
                elif "404" in err_str or "not_found" in err_str:
                    if fallbacks:
                        fallback_model = fallbacks.pop(0)
                        logger.warning(f"[GeminiService] Model '{current_llm.model}' not found (404). Falling back to '{fallback_model}'...")
                        current_llm = self._get_fallback_llm(fallback_model)
                        continue
                logger.error(f"[GeminiService] Gemini LLM invocation failed: {e}")
                raise e

    async def astream(self, prompt: str):
        models = [self.model_name] + [
            m for m in [
                "models/gemini-flash-latest",
                "models/gemini-2.0-flash",
            ] if m != self.model_name
        ]
        
        last_error = None
        
        for model in models:
            llm = self._get_fallback_llm(model)

            for attempt in range(3):
                try:
                    async for chunk in llm.astream(prompt):
                        yield chunk
                    last_error = None
                    break

                except Exception as e:
                    last_error = e
                    err = str(e).lower()

                    if (
                        "429" in err
                        or "503" in err
                        or "resource_exhausted" in err
                        or "unavailable" in err
                        or "timeout" in err
                        or "connectionerror" in err
                    ):
                        if attempt < 2:
                            sleep_time = 0.5 * (attempt + 1)
                            logger.warning(
                                f"[GeminiService] {model} busy/error. Retrying in {sleep_time}s..."
                            )
                            await asyncio.sleep(sleep_time)
                            continue

                        break

                    if "404" in err or "not_found" in err:
                        logger.warning(f"[GeminiService] {model} not available. Trying next model...")
                        break

                    raise

            if last_error is None:
                break

        if last_error:
            logger.error(f"[GeminiService] Gemini LLM streaming failed: {last_error}")
            raise last_error
