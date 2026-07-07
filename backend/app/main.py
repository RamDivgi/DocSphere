from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.documents import router as documents_router
from app.api.auth import router as auth_router
from app.core.config import settings
from app.api.test_vector import router as vector_router
from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
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