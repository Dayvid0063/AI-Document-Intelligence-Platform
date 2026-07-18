# Frontend — AI Document Intelligence Platform

Next.js frontend for the document intelligence platform. Dark/light themed dashboard UI built with TypeScript, Tailwind CSS v4, shadcn/ui (Nova/Radix preset) and Zustand for global state management.

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
│   ├── globals.css              # Design tokens (CSS variables, light + dark themes)
│   ├── layout.tsx               # Root layout with FOUC prevention script
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
│   │   ├── Navbar.tsx           # Sticky nav with mobile menu + theme toggle
│   │   ├── Hero.tsx             # Hero with dashboard mockup
│   │   ├── Features.tsx         # 8-feature grid
│   │   ├── HowItWorks.tsx       # 4-step pipeline explanation
│   │   ├── Pricing.tsx          # 3-tier pricing (paid plans coming soon)
│   │   └── Footer.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx          # Fixed left nav with active glow state
│   │   ├── Topbar.tsx           # Page title + mobile hamburger + theme toggle
│   │   └── DashboardLayout.tsx  # Layout shell with polling + toasts
│   └── ui/
│       ├── Toast.tsx            # Toast notification component
│       └── ThemeToggle.tsx      # Sun/moon icon button
├── lib/
│   ├── api.ts                   # Axios instance with JWT interceptor
│   ├── auth.ts                  # Raw auth API calls
│   ├── documents.ts             # Document API calls + usage/audit methods
│   ├── chat.ts                  # Search and chat API calls
│   ├── stores/
│   │   ├── useAuthStore.ts      # User profile, tokens, login/register/logout
│   │   ├── useDocumentStore.ts  # Documents list, CRUD operations
│   │   ├── useToastStore.ts     # Toast notification queue
│   │   └── useThemeStore.ts     # Light/dark theme preference
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

All colors are defined as CSS variables in `app/globals.css`. The app supports **light and dark themes** — switching one token updates the entire application.

### Theme switching

Theme is controlled by a `data-theme` attribute on the `<html>` element:

```html
<html data-theme="dark">   <!-- dark mode -->
<html data-theme="light">  <!-- light mode -->
```

CSS variables switch automatically based on this attribute. No Tailwind `dark:` variants needed.

**Behavior:**
- First visit → matches system/OS preference (`prefers-color-scheme`)
- Manual toggle → sun/moon icon in landing navbar and dashboard topbar
- Preference persisted to localStorage via `useThemeStore`
- FOUC prevention → inline script in `layout.tsx` sets `data-theme` before React hydrates

### Core design tokens

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--background` | `#0A0A0F` | `#F8F9FC` | Page background |
| `--surface` | `#111118` | `#FFFFFF` | Cards, panels |
| `--surface-elevated` | `#1A1A2E` | `#F1F3F9` | Modals, dropdowns |
| `--primary` | `#6366F1` | `#6366F1` | Indigo — main accent |
| `--cyan` | `#06B6D4` | `#0891B2` | Cyan — highlights |
| `--foreground` | `#FFFFFF` | `#0F1117` | Headings |
| `--foreground-muted` | `#94A3B8` | `#4B5468` | Body text |
| `--success` | `#10B981` | `#059669` | Completed states |
| `--warning` | `#F59E0B` | `#D97706` | Pending states |
| `--destructive` | `#EF4444` | `#DC2626` | Errors, delete |

---

## State management

Four Zustand stores manage global state:

**`useAuthStore`** — persisted to localStorage (`docintel-auth`)
- `user`, `access_token`, `refresh_token`, `isAuthenticated`
- `login()`, `register()`, `logout()`, `fetchProfile()`

**`useDocumentStore`** — in-memory, reset on logout
- `documents`, `total`, `initialized`
- `fetchDocuments()`, `addDocument()`, `updateDocument()`, `removeDocument()`

**`useToastStore`** — in-memory notification queue
- `toasts`, `addToast()`, `removeToast()`

**`useThemeStore`** — persisted to localStorage (`docintel-theme`)
- `theme` — `"dark"` or `"light"`
- `setTheme()`, `toggleTheme()`

---

## Smart polling

`useDocumentPolling` hook (wired into `DashboardLayout` — runs on all dashboard pages):

- Checks if any documents have `status === "pending"` or `status === "processing"`
- If yes: polls `GET /documents/` every **5 seconds**
- On completion: calls `updateDocument()` and fires a toast notification
- Stops automatically when no in-flight documents remain
- Clears interval on unmount — no memory leaks

---

## Key design decisions

**Route group layout** — `app/(dashboard)/layout.tsx` runs once on dashboard entry. Waits for Zustand rehydration, checks auth, fetches profile and documents once. All pages read from the store — no duplicate API calls on navigation.

**FOUC prevention** — inline `<script>` in `layout.tsx` reads `docintel-theme` from localStorage and sets `data-theme` on `<html>` before React hydrates. `suppressHydrationWarning` on the `<html>` element silences the expected React hydration mismatch warning (same approach used by `next-themes`).

**`isAuthenticated` hydration** — Zustand `persist` rehydrates asynchronously. Dashboard layout defers auth checks with `setTimeout(() => setHydrated(true), 0)` to avoid false redirects on first render.

**API client** — `lib/api.ts` reads JWT token directly from Zustand persisted state in localStorage on every request. On 401, clears localStorage and redirects to login.

**`is_embedded` flag** — backend never sends the raw 1536-dim vector to the frontend. Boolean flag instead — chat page filters the document selector without receiving megabytes of vector data.

---

## UI component library

Uses [shadcn/ui](https://ui.shadcn.com) with the **Nova** preset and **Radix** component library. All shadcn components use CSS variables and theme correctly in both light and dark modes automatically.

Installed components: `button`, `badge`, `card`, `avatar`, `dropdown-menu`, `separator`

Install additional components:
```bash
npx shadcn@latest add <component-name>
```