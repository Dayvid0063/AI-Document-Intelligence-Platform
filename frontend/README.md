# Frontend — AI Document Intelligence Platform

Next.js 16 frontend for the document intelligence platform. Clean, minimal dashboard UI built with TypeScript, Tailwind CSS, and shadcn/ui.

---

## Prerequisites

- **Node.js 18+**
- **npm**
- Backend API running locally — see [`backend/README.md`](../backend/README.md)

---

## Local setup

### 1. Navigate to the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This points the frontend at your local FastAPI backend. In production, replace with your deployed backend URL.

### 4. Start the development server

```bash
npm run dev
```

The app is available at `http://localhost:3000`

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## Pages & routes

| Route | Description | Auth required |
|-------|-------------|---------------|
| `/` | Root redirect — sends to `/dashboard` or `/login` | No |
| `/login` | Sign in with email and password | No |
| `/register` | Create a new account | No |
| `/dashboard` | Overview with stats, recent documents, upload | Yes |
| `/documents` | Full document list with all management actions | Yes |
| `/search` | Semantic search across embedded documents | Yes |
| `/chat` | RAG chat — ask questions about your documents | Yes |
| `/settings` | Profile info, bulk export, API access (coming soon) | Yes |

---

## Project structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── search/page.tsx
│   │   ├── chat/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx
│   └── page.tsx              # Root redirect
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── documents/
│   │   ├── DocumentUpload.tsx   # Drag-and-drop with auto-pipeline progress
│   │   ├── DocumentList.tsx     # Table with status badges and actions menu
│   │   ├── DocumentPreview.tsx  # Modal: AI summary, fields, raw text, export
│   │   └── StatusBadge.tsx      # Colored status pill (pending/completed/failed)
│   ├── dashboard/
│   │   └── StatCards.tsx        # Total / Processed / Pending / Failed counts
│   └── layout/
│       ├── Sidebar.tsx          # Fixed left nav with active state
│       ├── Topbar.tsx           # Page title + user dropdown
│       └── DashboardLayout.tsx  # Auth guard + layout shell
├── lib/
│   ├── api.ts          # Axios instance with JWT interceptor + 401 redirect
│   ├── auth.ts         # Auth service (register, login, getMe, logout)
│   ├── documents.ts    # Document service (upload, list, process, analyze, embed, export)
│   ├── chat.ts         # Chat service (search, chatWithDocument, chatWithAll)
│   └── hooks/
│       └── useAuth.ts  # Shared hook for protected pages — fetches current user
└── types/
    ├── auth.ts          # User, AuthTokens, LoginPayload, RegisterPayload
    ├── document.ts      # Document, DocumentStatus, DocumentListResponse
    └── chat.ts          # ChatMessage, ChatResponse, SearchResponse
```

---

## Key design decisions

**Route groups** — `(auth)` and `(dashboard)` are Next.js route groups. The parentheses mean they don't appear in the URL — they're just for organizing layouts and applying different shells (auth pages have no sidebar; dashboard pages do).

**API client** — `lib/api.ts` is a single Axios instance shared across all services. It automatically attaches the JWT from `localStorage` to every request and redirects to `/login` on a 401 response.

**Auth guard** — `DashboardLayout` uses the `useAuth` hook to check authentication and fetch the current user on every protected page. Unauthenticated users are redirected to `/login` before anything renders.

**Service layer** — API calls live in `lib/auth.ts`, `lib/documents.ts`, and `lib/chat.ts`. Components never call Axios directly — they call service methods. This keeps UI components clean and makes the API layer easy to swap or test.

**`is_embedded` flag** — the backend never sends the raw 1536-dimensional embedding vector to the frontend (too large). Instead it sends a boolean `is_embedded` field. The chat page uses this to filter the document selector to only show documents ready for semantic search.

---

## Document pipeline (frontend perspective)

When a user drops a file on the upload zone:

1. File is sent to `POST /api/v1/documents/upload`
2. The backend runs the full pipeline synchronously: OCR → AI analysis → embedding
3. The upload component shows "Running OCR, AI analysis & embedding..." while waiting
4. On completion, the fully processed document is returned and added to the list
5. The document immediately shows its `document_type`, `is_embedded` badge, and is available in Search and Chat

---

## UI component library

This project uses [shadcn/ui](https://ui.shadcn.com) with the **Nova** preset and **Radix** as the component library. Components are installed individually via:

```bash
npx shadcn@latest add <component-name>
```

Currently installed: `button`, `badge`, `card`, `avatar`, `dropdown-menu`, `separator`