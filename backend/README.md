# Backend — AI Document Intelligence Platform

FastAPI backend powering the full document intelligence pipeline: JWT auth, file upload to Cloudflare R2, OCR extraction, AI analysis via DeepSeek, vector embeddings via OpenAI, semantic search via pgvector, RAG chat, background processing via Celery, rate limiting, audit logs and usage tracking.

---

## Prerequisites

- **Python 3.12** (3.13+ causes wheel incompatibilities with several dependencies)
- **Docker Desktop** (for PostgreSQL + Redis via Docker Compose)
- **Tesseract OCR** — [Download for Windows](https://github.com/UB-Mannheim/tesseract/wiki)
- **Poppler** — [Download for Windows](https://github.com/oschwartz10612/poppler-windows/releases)
- **DeepSeek API key** — [platform.deepseek.com](https://platform.deepseek.com)
- **OpenAI API key** — [platform.openai.com](https://platform.openai.com) (embeddings only)
- **Cloudflare R2** — bucket + API credentials for file storage

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

Edit `.env` with your real values — see [Environment variables](#environment-variables) below.

### 5. Start services with Docker Compose

From the project root:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** with pgvector extension (`docintel-postgres` on port 5432)
- **Redis 7** (`docintel-redis` on port 6379)

### 6. Enable the pgvector extension

```bash
docker exec -it docintel-postgres psql -U postgres -d docintel -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 7. Run database migrations

```bash
alembic upgrade head
```

Applies all migrations:
- Create `users` table
- Create `documents` table
- Add `extracted_fields` (JSONB) column
- Add `embedding` (Vector 1536) column
- Create `audit_logs` table
- Create `usage_logs` table

### 8. Start the development server

```bash
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### 9. Start the Celery worker (separate terminal)

```bash
# Windows
celery -A app.worker.celery_app worker --loglevel=info --pool=eventlet

# macOS/Linux
celery -A app.worker.celery_app worker --loglevel=info --concurrency=2
```

On Windows, install eventlet first:
```bash
pip install eventlet
```

---

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg://postgres:postgres@localhost:5432/docintel` |
| `SECRET_KEY` | JWT signing secret (`openssl rand -hex 32`) | `abc123...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `DEEPSEEK_API_KEY` | DeepSeek API key | `sk-...` |
| `DEEPSEEK_MODEL` | DeepSeek model name | `deepseek-v4-flash` |
| `DEEPSEEK_BASE_URL` | DeepSeek API base URL | `https://api.deepseek.com` |
| `OPENAI_API_KEY` | OpenAI API key (embeddings only) | `sk-...` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | `abc123` |
| `R2_ACCESS_KEY_ID` | R2 access key | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `...` |
| `R2_BUCKET_NAME` | R2 bucket name | `docintel-uploads` |
| `R2_ENDPOINT` | R2 S3-compatible endpoint | `https://<id>.r2.cloudflarestorage.com` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `ENVIRONMENT` | Runtime environment | `development` |
| `DEBUG` | Enable debug mode | `True` |

---

## Architecture

```
app/
├── core/
│   ├── config.py           # Pydantic settings loaded from .env
│   ├── database.py         # SQLAlchemy engine, session, Base
│   ├── security.py         # JWT creation/verification, bcrypt
│   └── limiter.py          # slowapi rate limiter instance
├── models/
│   ├── user.py             # Users table
│   ├── document.py         # Documents table (pgvector embedding column)
│   ├── audit_log.py        # Audit logs table
│   └── usage_log.py        # Usage/cost tracking table
├── schemas/
│   ├── user.py             # Auth request/response schemas
│   ├── document.py         # Document response schemas
│   ├── audit_log.py        # Audit log response schemas
│   └── usage_log.py        # Usage summary schemas
├── api/v1/endpoints/
│   ├── auth.py             # /register, /login, /me
│   ├── documents.py        # Upload, list, get, process, analyze, embed, delete
│   ├── search.py           # POST /search/ — semantic vector search
│   ├── chat.py             # POST /chat/ — RAG Q&A
│   ├── export.py           # CSV + Excel export (bulk + per-document)
│   ├── audit.py            # GET /audit/ — user activity log
│   └── usage.py            # GET /usage/ — token usage + cost summary
├── services/
│   ├── ocr_service.py      # pypdf + Tesseract + scanned PDF fallback
│   ├── ai_service.py       # DeepSeek: classify + summarize + extract
│   ├── embedding_service.py # OpenAI text-embedding-3-small (1536 dims)
│   ├── rag_service.py      # Semantic search + RAG chat
│   ├── storage_service.py  # Cloudflare R2 upload/download/delete
│   ├── document_service.py # File save/delete, DB helpers
│   ├── audit_service.py    # Write + read audit log entries
│   └── usage_service.py    # Log token usage + calculate costs
├── tasks/
│   └── document_tasks.py   # Celery background pipeline task
└── worker.py               # Celery app instance (broker: Redis)
```

---

## Document pipeline

When a file is uploaded the following runs automatically in the background:

```
Upload → Save to R2 → Queue Celery task → Return instantly (status: pending)

[Celery Worker — background]
  → OCR extraction (pypdf or Tesseract)    [status: processing]
  → AI analysis (DeepSeek)
  → Vector embedding (OpenAI)
  → Update DB                              [status: completed]
```

Manual fallback endpoints (`/process`, `/analyze`, `/embed`) are available if the pipeline fails.

---

## Rate limits

| Endpoint | Limit |
|----------|-------|
| POST /documents/upload | 20/hour per user |
| POST /documents/{id}/analyze | 30/hour per user |
| POST /documents/{id}/embed | 30/hour per user |
| POST /chat/ | 50/hour per user |
| POST /search/ | 100/hour per user |
| POST /auth/login | 10/hour per IP |
| POST /auth/register | 5/hour per IP |

---

## Supported file types

| Type | Extension | OCR method |
|------|-----------|-----------|
| Text-based PDF | `.pdf` | pypdf direct extraction |
| Scanned/image PDF | `.pdf` | pdf2image + Tesseract fallback |
| Image | `.png`, `.jpg`, `.jpeg`, `.tiff` | Tesseract OCR |

Maximum file size: **10MB**

---

## AI cost tracking

Every AI API call is tracked with token counts and USD cost:

| Operation | Model | Tracked |
|-----------|-------|---------|
| Document analysis | deepseek-v4-flash | input + output tokens |
| Vector embedding | text-embedding-3-small | input tokens |
| RAG chat | deepseek-v4-flash | input + output tokens |
| Semantic search | text-embedding-3-small | input tokens |

View your usage summary at `GET /api/v1/usage/`.

---

## Daily local workflow

```bash
# Start services
docker start docintel-postgres docintel-redis

# Activate venv
cd backend
source venv/Scripts/activate   # Windows Git Bash

# Terminal 1 — API server
uvicorn app.main:app --reload

# Terminal 2 — Celery worker
celery -A app.worker.celery_app worker --loglevel=info --pool=eventlet

# Stop when done: Ctrl+C both terminals
deactivate
docker stop docintel-postgres docintel-redis
```

---

## Railway deployment

The backend runs as **two separate Railway services** from the same repo:

| Service | Start command |
|---------|--------------|
| `AI-Document-Intelligence-Platform` (web) | `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| `docintel-worker` (Celery) | `celery -A app.worker.celery_app worker --loglevel=info --concurrency=1` |

Both services share the same environment variables. The worker needs:
```
RAILPACK_BUILD_APT_PACKAGES=tesseract-ocr tesseract-ocr-eng poppler-utils
RAILPACK_DEPLOY_APT_PACKAGES=tesseract-ocr tesseract-ocr-eng poppler-utils
RAILPACK_PYTHON_VERSION=3.12
```

---

## Common issues

**psycopg2 wheel error** — Use `psycopg[binary]` (psycopg3). Already in `requirements.txt`.

**bcrypt/passlib incompatibility** — Pin `bcrypt==4.0.1`. Already in `requirements.txt`.

**Alembic pgvector migration error** — Autogenerated migrations reference `pgvector` without importing it. Fix by adding `from pgvector.sqlalchemy import Vector` and replacing the column definition with `Vector(1536)`.

**Railway DATABASE_URL scheme** — Railway injects `postgresql://` but psycopg3 needs `postgresql+psycopg://`. Auto-conversion is handled in `database.py` and `alembic/env.py`.

**Celery SIGKILL on Railway** — OOM on very large scanned PDFs. Set `--concurrency=1` on the worker service and test with smaller files first.

**Tesseract not found** — Confirm Tesseract is installed and on PATH. On Windows the default path is `C:\Program Files\Tesseract-OCR\tesseract.exe`.