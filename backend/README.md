# Backend — AI Document Intelligence Platform

FastAPI backend powering the document intelligence pipeline: JWT authentication, file upload, OCR text extraction, AI analysis via DeepSeek, vector embeddings via OpenAI, semantic search via pgvector, and RAG chat.

---

## Prerequisites

- **Python 3.12** (3.13+ causes wheel incompatibilities with several dependencies)
- **Docker Desktop** (for PostgreSQL and Redis)
- **Tesseract OCR** — [Download for Windows](https://github.com/UB-Mannheim/tesseract/wiki)
- **Poppler** — [Download for Windows](https://github.com/oschwartz10612/poppler-windows/releases) (required by pdf2image for scanned PDF fallback)
- A **DeepSeek API key** — [platform.deepseek.com](https://platform.deepseek.com)
- An **OpenAI API key** — [platform.openai.com](https://platform.openai.com) (used only for embeddings via `text-embedding-3-small`)

---

## Local setup

### 1. Navigate to the backend folder

```bash
cd backend
```

### 2. Create a virtual environment with Python 3.12

```bash
py -3.12 -m venv venv
```

Activate it:

```bash
# Windows (Git Bash)
source venv/Scripts/activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` with your real values — see the [Environment variables](#environment-variables) section below.

### 5. Start services with Docker Compose

From the project root:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** with the `pgvector` extension (`docintel-postgres` on port 5432)
- **Redis 7** (`docintel-redis` on port 6379)

### 6. Enable the pgvector extension

```bash
docker exec -it docintel-postgres psql -U postgres -d docintel -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 7. Run database migrations

```bash
alembic upgrade head
```

This applies all migrations in order:
- Create `users` table
- Create `documents` table
- Add `extracted_fields` (JSONB) column
- Add `embedding` (Vector 1536) column

### 8. Start the development server

```bash
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`
Interactive Swagger docs at `http://localhost:8000/docs`

---

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_NAME` | Application name | `AI Document Intelligence Platform` |
| `ENVIRONMENT` | Runtime environment | `development` |
| `DEBUG` | Enable debug mode | `True` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresq...` |
| `SECRET_KEY` | JWT signing secret (generate with `openssl rand -hex 32`) | `abc123...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `DEEPSEEK_API_KEY` | DeepSeek API key | `sk-...` |
| `DEEPSEEK_MODEL` | DeepSeek model name | `deepseek-v4-flash` |
| `DEEPSEEK_BASE_URL` | DeepSeek API base URL | `https://api.deepseek.com` |
| `OPENAI_API_KEY` | OpenAI API key (embeddings only) | `sk-...` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

---

## Services & architecture

```
app/
├── core/
│   ├── config.py        # Pydantic settings loaded from .env
│   ├── database.py      # SQLAlchemy engine, session, Base
│   └── security.py      # JWT creation/verification, bcrypt hashing
├── models/
│   ├── user.py          # Users table
│   └── document.py      # Documents table (with pgvector embedding column)
├── schemas/
│   ├── user.py          # UserCreate, UserLogin, UserResponse, Token
│   └── document.py      # DocumentResponse, DocumentListResponse
├── api/v1/endpoints/
│   ├── auth.py          # /register, /login, /me
│   ├── documents.py     # /upload (auto-pipeline), /process, /analyze, /embed, /delete
│   ├── search.py        # POST /search/ — semantic vector search
│   ├── chat.py          # POST /chat/ — RAG Q&A (single doc or all docs)
│   └── export.py        # GET /export/csv, /export/excel (bulk + per-document)
└── services/
    ├── ocr_service.py       # pypdf + Tesseract OCR + scanned PDF fallback
    ├── ai_service.py        # DeepSeek: classify + summarize + extract fields
    ├── embedding_service.py # OpenAI text-embedding-3-small (1536 dims)
    ├── rag_service.py       # Semantic search + RAG chat with DeepSeek
    └── document_service.py  # File save/delete, DB helpers
```

---

## Upload pipeline

When a file is uploaded, the following runs automatically in sequence:

```
Upload file → Save to /uploads/ → OCR extraction → AI analysis → Vector embedding
```

If any step fails, the error is logged and the pipeline continues with what it has — partial results are better than nothing. Manual re-trigger endpoints (`/process`, `/analyze`, `/embed`) are available as fallbacks.

---

## Supported file types

| Type | Extension | OCR method |
|------|-----------|-----------|
| Text-based PDF | `.pdf` | pypdf direct extraction |
| Scanned/image PDF | `.pdf` | pdf2image + Tesseract fallback |
| Image | `.png`, `.jpg`, `.jpeg`, `.tiff` | Tesseract OCR |

Maximum file size: **10MB**

---

## Common issues

**`psycopg2` wheel error on install**
Use `psycopg[binary]` (psycopg3) instead — already configured in `requirements.txt`.

**`bcrypt` / `passlib` incompatibility**
Pin `bcrypt==4.0.1` — already in `requirements.txt`.

**Alembic autogenerate fails for pgvector columns**
Autogenerated migrations reference `pgvector.sqlalchemy.vector.VECTOR` without importing it. Manually fix by adding `from pgvector.sqlalchemy import Vector` and replacing the column definition with `Vector(1536)`.

**Tesseract not found**
Confirm Tesseract is installed and the path in `ocr_service.py` matches your install location (`C:\Program Files\Tesseract-OCR\tesseract.exe` on Windows by default).

**DeepSeek AI returns truncated JSON**
Increase `max_tokens` in `ai_service.py`. The default is set to `2000` to prevent truncation of large documents.
