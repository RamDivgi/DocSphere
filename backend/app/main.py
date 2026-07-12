import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

from app.api.documents import router as documents_router
from app.api.test_vector import router as vector_router
from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router
from app.api.session import router as session_router
from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base

logger = logging.getLogger("app.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Allowed frontend origins
origins = [
    "http://localhost:5173",          # Local development
    "http://127.0.0.1:5173",
    "https://docsphere-ai.vercel.app" # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    logger.info("Verifying database schema and self-healing columns on startup...")
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            db.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS content TEXT;"))
            db.commit()
            logger.info("Database schema verification and column synchronization completed successfully.")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Startup schema verification encountered an issue: {e}")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


app.include_router(
    session_router,
    prefix="/api/v1/session",
    tags=["Session"],
)

app.include_router(
    documents_router,
    prefix="/api/v1/documents",
    tags=["Documents"],
)

app.include_router(
    vector_router,
    prefix="/api/v1/test",
    tags=["Vector Test"],
)

app.include_router(
    chat_router,
    prefix="/api/v1/chat",
    tags=["Chat"],
)

app.include_router(
    conversations_router,
    prefix="/api/v1/conversations",
    tags=["Conversations"],
)


@app.get("/")
def root():
    return {
        "message": "DocSphere API Running 🚀"
    }