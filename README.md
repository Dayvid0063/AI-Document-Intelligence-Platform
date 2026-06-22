# AI Document Intelligence Platform

A full-stack document intelligence platform that transforms unstructured documents into structured, searchable, and conversational data.

> Think of it as a lightweight version of **Microsoft Azure AI Document Intelligence** or **Google Cloud Document AI**.

---

## What it does

Upload a PDF, image, or scanned document and the platform automatically:

1. **Extracts text** using OCR (Optical Character Recognition) — the process of reading text from images and scanned files
2. **Classifies the document** — identifies whether it's an invoice, resume, contract, receipt, bank statement, and more
3. **Summarizes the content** — generates a concise 2–3 sentence description
4. **Extracts structured data** — pulls key fields into clean JSON (e.g. candidate name, skills, and experience from a resume; vendor, amount, and due date from an invoice)
5. **Makes it searchable** — converts document meaning into a vector (a list of numbers representing semantic meaning) stored in a database, enabling search by *concept* rather than exact keywords
6. **Enables conversation** — lets users ask natural language questions about their documents using RAG (Retrieval Augmented Generation), where the AI reads your actual documents before answering

---

## Key features

### Document processing
- Drag-and-drop file upload (PDF, PNG, JPG, TIFF — up to 10MB)
- OCR text extraction via `pypdf` for text-based PDFs and Tesseract for scanned documents and images
- Automatic fallback: if a PDF contains only scanned images, the platform detects this and switches to image-based OCR

### AI intelligence (powered by DeepSeek)
- **Document classification** — identifies document type from a defined taxonomy
- **AI summarization** — concise natural language summary of every document
- **Structured field extraction** — returns key data as typed JSON per document type
- **Automatic pipeline** — OCR, classification, summarization, and embedding all run automatically on upload

### Semantic search (powered by OpenAI embeddings + pgvector)
- Search documents by *meaning*, not just keywords
- Searching "money owed" finds invoices even if that phrase never appears
- Built on `pgvector` — PostgreSQL's native vector extension — no separate vector database needed

### RAG chat (powered by DeepSeek)
- Ask questions about a specific document: *"What are this candidate's main skills?"*
- Ask questions across all documents: *"Which documents mention Docker?"*
- Answers are grounded in your actual document content, with source attribution

### Export
- Download extracted fields as CSV or Excel
- Per-document or bulk export of all documents

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.12 |
| Database | PostgreSQL 16 with pgvector extension |
| Cache | Redis 7 |
| ORM & Migrations | SQLAlchemy 2, Alembic |
| OCR | pypdf, Tesseract, pdf2image |
| AI — Analysis & Chat | DeepSeek API (deepseek-v4-flash) |
| AI — Embeddings | OpenAI API (text-embedding-3-small, 1536 dimensions) |
| Infrastructure | Docker Compose |

---

## Project structure

```
ai-doc-intelligence/
├── docker-compose.yml        # PostgreSQL (pgvector) + Redis
├── README.md
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── core/             # Config, database connection, JWT/bcrypt security
│   │   ├── models/           # SQLAlchemy ORM models (users, documents)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── api/v1/
│   │   │   └── endpoints/    # auth, documents, search, chat, export
│   │   ├── services/         # Business logic (OCR, AI, embeddings, RAG)
│   │   └── alembic/          # Database migration history
│   ├── uploads/              # Local file storage (gitignored)
│   └── requirements.txt
└── frontend/                 # Next.js application
    ├── app/
    │   ├── (auth)/           # login, register pages
    │   └── (dashboard)/      # dashboard, documents, search, chat, settings
    ├── components/
    │   ├── auth/             # LoginForm, RegisterForm
    │   ├── documents/        # Upload, List, Preview, StatusBadge
    │   └── layout/           # Sidebar, Topbar, DashboardLayout
    ├── lib/                  # API client, auth service, document service, chat service
    └── types/                # TypeScript type definitions
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login, receive JWT tokens |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/documents/upload` | Upload + auto-process a document |
| GET | `/api/v1/documents/` | List all user documents |
| GET | `/api/v1/documents/{id}` | Get a single document |
| POST | `/api/v1/documents/{id}/process` | Manually trigger OCR |
| POST | `/api/v1/documents/{id}/analyze` | Manually trigger AI analysis |
| POST | `/api/v1/documents/{id}/embed` | Manually trigger embedding |
| DELETE | `/api/v1/documents/{id}` | Delete a document |
| POST | `/api/v1/search/` | Semantic search across documents |
| POST | `/api/v1/chat/` | Chat with one or all documents |
| GET | `/api/v1/export/csv` | Export all documents as CSV |
| GET | `/api/v1/export/excel` | Export all documents as Excel |
| GET | `/api/v1/export/csv/{id}` | Export single document as CSV |
| GET | `/api/v1/export/excel/{id}` | Export single document as Excel |

---

## Setup

- **Backend setup** → see [`backend/README.md`](./backend/README.md)
- **Frontend setup** → see [`frontend/README.md`](./frontend/README.md)

---

## Live demo

> Coming soon — deployment in progress.

---

## Author

**David Orji** — Full-stack & AI Engineer
- GitHub: [@Dayvid0063](https://github.com/Dayvid0063)
- LinkedIn: [david-orji](https://www.linkedin.com/in/david-orji-)
- Portfolio: [david-portfolio-inky.vercel.app](https://david-portfolio-inky.vercel.app)

