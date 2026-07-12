# 🚀 DocSphere – AI-Powered Document Intelligence Platform

DocSphere is a production-ready AI document assistant that enables users to upload PDF documents and interact with them through natural language conversations. Built using Retrieval-Augmented Generation (RAG), it combines semantic search with Google Gemini to deliver accurate, context-aware answers grounded in the uploaded document.

## 🌐 Live Demo

**Application:** https://docsphere-ai.vercel.app/

---

# ✨ Features

- 📄 Upload PDF documents
- 🤖 Chat with PDFs using AI
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔍 Semantic search with FAISS vector database
- 💬 Multiple conversations per document
- 📝 Automatic conversation title generation
- 👤 Anonymous session-based experience (no signup/login)
- 💾 Session persistence across browser refresh
- 🗂 Conversation history until session reset
- 📱 Fully responsive (Desktop, Tablet & Mobile)
- 🌙 Modern dark UI
- ⚡ Fast PDF processing
- 🔄 Automatic state restoration after refresh
- 🧹 Complete session cleanup on logout

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite 8
- Tailwind CSS
- Zustand + Persist Middleware
- Axios
- Lucide React

## Backend

- FastAPI
- SQLAlchemy 2
- Alembic
- PostgreSQL (Neon)

## AI & RAG

- Google Gemini 2.5 Flash
- Google Gemini Embedding-001
- Ollama (llama3.2 for local inference)
- LangChain / LangChain Ollama
- FAISS
- PyMuPDF (fitz)

---

# 🏗 System Architecture

```text
                 User
                   │
                   ▼
        React + TypeScript (Vite)
                   │
              Zustand Store
                   │
              Axios Requests
                   │
                   ▼
             FastAPI Backend
                   │
     ┌─────────────┼──────────────┐
     │             │              │
 PostgreSQL      FAISS        LLM Factory
   (Neon)     Vector Store    (Router)
     │             │              │
     └─────────────┼──────────────┴──────────────┐
                   │                             │
                   ▼                             ▼
             Gemini 2.5 Flash               Ollama (Local)
             (Primary LLM)                  (Fallback)
```

---

# ⚙️ Working Flow

## 1. Session Initialization

- User enters their name.
- A unique UUID (`session_id`) is generated.
- Session ID and username are stored using Zustand Persist in localStorage.
- Every API request includes the `X-Session-ID` header.

---

## 2. PDF Upload & Processing

When a PDF is uploaded:

1. PDF is stored in `uploads/pdfs/`.
2. Document metadata is saved in PostgreSQL.
3. Text is extracted using PyMuPDF.
4. Text is divided into semantic chunks (1000 characters with 200 overlap).
5. Gemini Embedding-001 generates vector embeddings.
6. FAISS builds and stores a vector index in:

```
vectorstore/{document_id}/
```

---

## 3. AI Question Answering (RAG)

For every question:

1. Load the document's FAISS index.
2. Retrieve the most relevant chunks using Maximal Marginal Relevance (MMR).
3. Build a contextual prompt.
4. Send prompt to `LLMFactory`.
5. Try `Gemini 2.5 Flash`. If rate-limited or offline, automatically fallback to `Ollama`.
6. Generate a grounded response and stream to the frontend.
7. Save the conversation in PostgreSQL.

---

## 4. Session Recovery

If the browser is refreshed:

- Session ID is restored.
- Username is restored.
- Selected document is restored.
- Active conversation is restored.
- Previous messages are automatically reloaded.
- React Router restores the current page without 404s.

---

## 5. Session Reset

Clicking **Reset Session**:

- Deletes uploaded PDFs.
- Deletes FAISS vector indexes.
- Deletes conversations.
- Deletes chat messages.
- Clears PostgreSQL records.
- Clears localStorage.
- Redirects back to the landing page.

---

# 📂 Project Structure

```text
DocSphere
│
├── frontend
│   ├── React
│   ├── TypeScript
│   ├── Zustand
│   ├── Tailwind CSS
│   └── Axios
│
└── backend
    ├── FastAPI
    ├── SQLAlchemy
    ├── PostgreSQL
    ├── LangChain
    ├── FAISS
    ├── Gemini
    └── PyMuPDF
```

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/RamDivgi/DocSphere.git
cd DocSphere
```

---

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Environment Variables

## Backend

```env
DATABASE_URL=

SECRET_KEY=

GEMINI_API_KEY=
LLM_PROVIDER=auto
OLLAMA_MODEL=llama3.2
GEMINI_CHAT_MODEL=models/gemini-2.0-flash
```

## Frontend

```env
VITE_API_URL=
```

---

# 🚀 Future Enhancements

- OCR support for scanned PDFs
- Multi-document chat
- Source citations with page numbers
- AI-generated document summaries
- Export conversations as PDF/Markdown
- Voice interaction
- Document folders & tagging

---

# 👨‍💻 Developer

**Shantaram S Divgi (Ram)**

- GitHub: https://github.com/RamDivgi
- Live Demo: https://docsphere-ai.vercel.app/

---

# ⭐ If you like this project

Please consider giving the repository a ⭐ on GitHub.
