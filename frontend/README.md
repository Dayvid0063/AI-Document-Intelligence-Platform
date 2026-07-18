# Frontend — AI Document Intelligence Platform

Next.js 16 frontend for the document intelligence platform. Dark-themed dashboard UI built with TypeScript, Tailwind CSS v4, shadcn/ui (Nova/Radix preset) and Zustand for global state management.

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

### 4. Start the development server

```bash
npm run dev
```

App available at `http://localhost:3000`

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## Pages & routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page with hero, features, how it works, pricing | No |
| `/login` | Sign in with email and password | No |
| `/register` | Create a new account | No |
| `/dashboard` | Overview — stats, recent documents, upload | Yes |
| `/documents` | Full document list with all management actions | Yes |
| `/search` | Semantic search across embedded documents | Yes |
| `/chat` | RAG chat — ask questions about your documents | Yes |
| `/settings` | Profile, usage stats, activity log, export | Yes |

---

## Project structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Auth guard + store initialization
│   │   ├── dashboard/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── search/page.tsx
│   │   ├── chat/page.tsx
│   │   └── settings/page.tsx
│   ├── globals.css              # Design tokens (CSS variables)
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # Split layout auth form
│   │   └── RegisterForm.tsx
│   ├── documents/
│   │   ├── DocumentUpload.tsx   # Drag-and-drop with pipeline progress
│   │   ├── DocumentList.tsx     # Table (desktop) + cards (mobile)
│   │   ├── DocumentPreview.tsx  # Modal: summary, fields, raw text, export
│   │   └── StatusBadge.tsx      # Colored status pill
│   ├── dashboard/
│   │   └── StatCards.tsx        # Total/Processed/Pending/Failed counts
│   ├── landing/
│   │   ├── Navbar.tsx           # Sticky nav with mobile menu
│   │   ├── Hero.tsx             # Hero with dashboard mockup
│   │   ├── Features.tsx         # 8-feature grid
│   │   ├── HowItWorks.tsx       # 4-step pipeline explanation
│   │   ├── Pricing.tsx          # 3-tier pricing (paid plans coming soon)
│   │   └── Footer.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx          # Fixed left nav with active glow state
│   │   ├── Topbar.tsx           # Page title + mobile hamburger menu
│   │   └── DashboardLayout.tsx  # Layout shell with polling + toasts
│   └── ui/
│       └── Toast.tsx            # Toast notification component
├── lib/
│   ├── api.ts                   # Axios instance with JWT interceptor
│   ├── auth.ts                  # Raw auth API calls
│   ├── documents.ts             # Document API calls + usage/audit methods
│   ├── chat.ts                  # Search and chat API calls
│   ├── stores/
│   │   ├── useAuthStore.ts      # User profile, tokens, login/register/logout
│   │   ├── useDocumentStore.ts  # Documents list, CRUD operations
│   │   └── useToastStore.ts     # Toast notification queue
│   └── hooks/
│       └── useDocumentPolling.ts # Smart 5s polling for pending documents
└── types/
    ├── auth.ts                  # User, AuthTokens, login/register payloads
    ├── document.ts              # Document, DocumentStatus, DocumentListResponse
    ├── chat.ts                  # ChatMessage, ChatResponse, SearchResponse
    └── usage.ts                 # UsageSummary, UsageLog, AuditLog
```

---

## Design system

All colors are defined as CSS variables in `app/globals.css`. Change any token once to update the entire application:

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0A0A0F` | Page background |
| `--surface` | `#111118` | Cards, panels |
| `--surface-elevated` | `#1A1A2E` | Modals, dropdowns |
| `--primary` | `#6366F1` | Indigo — main accent |
| `--cyan` | `#06B6D4` | Cyan — highlights |
| `--foreground` | `#FFFFFF` | Headings |
| `--foreground-muted` | `#94A3B8` | Body text |
| `--success` | `#10B981` | Completed states |
| `--warning` | `#F59E0B` | Pending states |
| `--destructive` | `#EF4444` | Errors, delete |

---

## State management

Three Zustand stores manage global state:

**`useAuthStore`** — persisted to localStorage via `zustand/persist`
- `user` — current user profile
- `access_token`, `refresh_token` — JWT tokens
- `isAuthenticated` — auth state
- `login()`, `register()`, `logout()`, `fetchProfile()` — actions

**`useDocumentStore`** — in-memory, reset on logout
- `documents` — full document list
- `initialized` — prevents duplicate fetches on navigation
- `addDocument()`, `updateDocument()`, `removeDocument()` — optimistic updates

**`useToastStore`** — in-memory notification queue
- `toasts` — active toast list
- `addToast()`, `removeToast()` — actions

---

## Smart polling

`useDocumentPolling` hook (wired into `DashboardLayout` — runs on all dashboard pages):

- Checks if any documents have `status === "pending"` or `status === "processing"`
- If yes: polls `GET /documents/` every **5 seconds**
- On each poll: compares statuses — if any document moved to `completed`, calls `updateDocument()` and fires a toast notification
- Stops automatically when no in-flight documents remain
- Clears interval on unmount to prevent memory leaks

---

## Key design decisions

**Route group layout** — `app/(dashboard)/layout.tsx` runs once when the user enters the dashboard. It waits for Zustand rehydration (one event loop tick via `setTimeout`), checks auth, fetches profile and documents once. All pages read from the store — no duplicate API calls on navigation.

**`isAuthenticated` hydration** — Zustand `persist` rehydrates from localStorage asynchronously. The dashboard layout defers auth checks with `setTimeout(() => setHydrated(true), 0)` to avoid false redirects to login on first render.

**API client** — `lib/api.ts` reads the JWT token directly from the Zustand persisted state in localStorage (`docintel-auth` key) on every request. On 401 response, clears localStorage and redirects to login.

**`is_embedded` flag** — the backend never sends the raw 1536-dimensional embedding vector to the frontend. Instead it sends a boolean `is_embedded` so the chat page can filter the document selector without receiving megabytes of vector data.

---

## UI component library

Uses [shadcn/ui](https://ui.shadcn.com) with the **Nova** preset and **Radix** component library.

Installed components: `button`, `badge`, `card`, `avatar`, `dropdown-menu`, `separator`

Install additional components:
```bash
npx shadcn@latest add <component-name>
```