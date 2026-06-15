# AI Document Intelligence Platform

A lightweight document intelligence platform: upload PDFs/images, extract text via OCR,
classify documents, extract structured data, and chat with your documents via RAG.

## Project Structure

```
ai-doc-intelligence/
├── backend/    # FastAPI + PostgreSQL + Redis + Celery
└── frontend/   # Next.js + TypeScript + Tailwind + shadcn/ui
```

## Backend Setup (Phase 1)

### Prerequisites
- Python 3.11+
- PostgreSQL running locally (or via Docker)
- Redis running locally (or via Docker) — needed later for Celery, optional for now

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env`:
- Set `DATABASE_URL` to your local PostgreSQL connection string.
- Generate a strong `SECRET_KEY`:
  ```bash
  openssl rand -hex 32
  ```
  Paste the output as `SECRET_KEY` in `.env`.

### 4. Create the database

Make sure PostgreSQL is running, then create the database referenced in `DATABASE_URL`:

```bash
createdb docintel
```

(Or use `psql -U postgres -c "CREATE DATABASE docintel;"`)

### 5. Run database migrations

We'll generate the first migration once the User model is in place:

```bash
alembic revision --autogenerate -m "create users table"
alembic upgrade head
```

### 6. Run the development server

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`
Interactive docs (Swagger UI): `http://localhost:8000/docs`

### Test the auth flow

1. `POST /api/v1/auth/register` — create an account, get back tokens.
2. `POST /api/v1/auth/login` — log in with email/password, get back tokens.
3. `GET /api/v1/auth/me` — pass `Authorization: Bearer <access_token>` to get your profile.
