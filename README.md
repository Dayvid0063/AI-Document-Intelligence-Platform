# AI Document Intelligence Platform

A full-stack, production-deployed document intelligence platform that transforms unstructured documents into structured, searchable and conversational data.

> Think of it as a lightweight alternative to **Microsoft Azure AI Document Intelligence** or **Google Cloud Document AI** — built on open models, deployed on modern infrastructure, at a fraction of the cost.

---

## Live Demo

**→ [ai-document-intelligence-platform-two.vercel.app](https://ai-document-intelligence-platform-two.vercel.app)**

Backend API docs: [ai-document-intelligence-platform-production.up.railway.app/docs](https://ai-document-intelligence-platform-production.up.railway.app/docs)

---

## What it does

Upload any PDF, image or scanned document and the platform automatically:

1. **Extracts text** via OCR — reads text from digital PDFs, scanned images and photos. Automatically falls back to Tesseract OCR for image-based documents
2. **Classifies the document** — identifies invoice, resume, contract, receipt, bank statement, government form and more
3. **Summarizes the content** — generates a concise AI-written description
4. **Extracts structured data** — pulls key fields into clean JSON per document type (e.g. vendor, amount, due date for invoices; candidate name, skills, experience for resumes)
5. **Makes it searchable** — converts document meaning into 1536-dimensional vectors stored in PostgreSQL via pgvector, enabling semantic search by concept rather than keyword
6. **Enables conversation** — ask natural language questions about your documents using RAG (Retrieval Augmented Generation), where the AI reads your actual documents before answering
7. **Processes in the background** — Celery workers handle the full pipeline asynchronously so uploads return instantly

---

## Key features

### Document processing
- Drag-and-drop file upload (PDF, PNG, JPG, TIFF — up to 10MB)
- Automatic pipeline: OCR → classify → summarize → extract → embed — all triggered on upload
- Real-time status updates via smart polling (pending → processing → completed)
- Files stored securely in Cloudflare R2

### AI intelligence (DeepSeek + OpenAI)
- **Document classification** — identifies type from a 10+ category taxonomy
- **AI summarization** — concise natural language summary per document
- **Structured field extraction** — typed JSON output tailored to document type
- **Two AI providers, one smart reason** — DeepSeek v4 Flash for analysis and chat (cheapest per token for long-context tasks), OpenAI text-embedding-3-small for embeddings (best quality/price ratio for vectors). Each task routed to the cheapest model that does it well

### Semantic search + RAG chat
- Search documents by meaning — finds "payment obligations" in invoices that never use those words
- Chat with a single document or across your entire library
- Answers grounded in your actual document content with source attribution
- Powered by pgvector cosine similarity search

### Production features
- **Background jobs** — Celery + Redis processes pipelines off the request thread
- **Rate limiting** — per-user and per-IP limits on all endpoints (slowapi + Redis)
- **Audit logs** — every key user action recorded with timestamp and metadata
- **Usage tracking** — token counts and USD cost per AI operation tracked and surfaced in the UI
- **Toast notifications** — real-time feedback when background processing completes

### Export
- Download extracted fields as CSV or Excel
- Per-document or bulk export

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui (Nova/Radix) |
| State management | Zustand with persistence |
| Backend | FastAPI, Python 3.12 |
| Background jobs | Celery 5.4, Redis 7 |
| Database | PostgreSQL 16 with pgvector extension |
| ORM & Migrations | SQLAlchemy 2, Alembic |
| OCR | pypdf, Tesseract, pdf2image |
| AI — Analysis & Chat | DeepSeek API (deepseek-v4-flash) |
| AI — Embeddings | OpenAI API (text-embedding-3-small, 1536 dims) |
| File storage | Cloudflare R2 (S3-compatible) |
| Backend hosting | Railway (web service + worker service) |
| Frontend hosting | Vercel |

---

## Project structure

```
ai-doc-intelligence/
├── docker-compose.yml          # PostgreSQL (pgvector) + Redis for local dev
├── README.md
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── core/               # Config, database, JWT/bcrypt security
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── api/v1/endpoints/   # auth, documents, search, chat, export, audit, usage
│   │   ├── services/           # OCR, AI, embeddings, RAG, storage, audit, usage
│   │   ├── tasks/              # Celery background tasks
│   │   ├── worker.py           # Celery app instance
│   │   └── alembic/            # Database migration history
│   └── requirements.txt
└── frontend/                   # Next.js application
    ├── app/
    │   ├── (auth)/             # login, register
    │   └── (dashboard)/        # dashboard, documents, search, chat, settings
    ├── components/
    │   ├── auth/               # LoginForm, RegisterForm
    │   ├── documents/          # Upload, List, Preview, StatusBadge
    │   ├── dashboard/          # StatCards
    │   ├── landing/            # Navbar, Hero, Features, HowItWorks, Pricing, Footer
    │   └── layout/             # Sidebar, Topbar, DashboardLayout
    ├── lib/
    │   ├── stores/             # Zustand: useAuthStore, useDocumentStore, useToastStore
    │   └── hooks/              # useDocumentPolling
    └── types/                  # TypeScript definitions
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (5/hr per IP) |
| POST | `/api/v1/auth/login` | Login (10/hr per IP) |
| GET | `/api/v1/auth/me` | Current user profile |
| POST | `/api/v1/documents/upload` | Upload + trigger background pipeline (20/hr) |
| GET | `/api/v1/documents/` | List all user documents |
| GET | `/api/v1/documents/{id}` | Get single document |
| POST | `/api/v1/documents/{id}/process` | Manual OCR trigger (fallback) |
| POST | `/api/v1/documents/{id}/analyze` | Manual AI analysis trigger (fallback) |
| POST | `/api/v1/documents/{id}/embed` | Manual embedding trigger (fallback) |
| DELETE | `/api/v1/documents/{id}` | Delete document + file |
| POST | `/api/v1/search/` | Semantic vector search (100/hr) |
| POST | `/api/v1/chat/` | RAG chat — single doc or all docs (50/hr) |
| GET | `/api/v1/export/csv` | Bulk CSV export |
| GET | `/api/v1/export/excel` | Bulk Excel export |
| GET | `/api/v1/export/csv/{id}` | Single document CSV |
| GET | `/api/v1/export/excel/{id}` | Single document Excel |
| GET | `/api/v1/audit/` | User activity log |
| GET | `/api/v1/usage/` | AI token usage + cost summary |

---

## Setup

- **Backend setup** → see [`backend/README.md`](./backend/README.md)
- **Frontend setup** → see [`frontend/README.md`](./frontend/README.md)

---

## Roadmap

- [x] **Phase 1 — MVP**: JWT auth, file upload, OCR extraction, AI summarization, dashboard UI
- [x] **Phase 2 — AI Engineering**: Document classification, structured extraction, vector embeddings, semantic search, RAG chat
- [x] **Phase 3 — Production**: Background jobs (Celery), rate limiting, audit logs, usage tracking, smart polling, toast notifications
- [ ] **Phase 4 — Monetization**: Stripe subscriptions, team workspaces, API access tokens, webhooks

---

## Author

**David Orji** — Full-stack & AI Engineer

- Portfolio: [david-portfolio-inky.vercel.app](https://david-portfolio-inky.vercel.app)
- GitHub: [@Dayvid0063](https://github.com/Dayvid0063)
- LinkedIn: [david-orji](https://www.linkedin.com/in/david-orji-)