# Okapi Real Estate Dashboard

A full-featured real estate management dashboard built with Next.js 16 (App Router). Manage **Agents**, **Agencies**, and **Properties** with full CRUD, server-side pagination, sorting, and search.

---

## Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Framework    | Next.js 16.2.6 (App Router, Turbopack)                  |
| UI           | React 19, Tailwind CSS v4, shadcn/ui, Radix UI          |
| Server State | TanStack Query v5                                       |
| Client State | Zustand v5 (dialogs, selected items, search params)     |
| HTTP Client  | Axios (relative URLs → Next.js API routes → backend)    |
| Forms        | React Hook Form + Zod v4                                |
| Charts       | Recharts                                                |
| Backend      | REST API at `http://localhost:3000` (proxied via Next.js)|

---

## Features

- **Agents** — list, create, view detail, delete with confirmation
- **Agencies** — list, create, view detail, delete with confirmation
- **Properties** — list, create, view detail, delete with confirmation (type, category, price, location)
- **URL-driven pagination** — page state lives in `?queryPage=N`, shareable and browser-history-aware
- **Server-side sorting** — click column headers to sort; resets to page 1
- **Server-side search** — search by name/title; resets to page 1
- **Dashboard home** — live portfolio counts + quick-action shortcuts
- **Authentication flow** — multi-step: identification → OTP → account creation → IDP setup
- **Responsive layout** — collapsible sidebar, mobile-aware

---

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:3000`

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (runs on :3001 when backend occupies :3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> Make sure your backend is running at `http://localhost:3000` before starting.

---

## Project Structure

```
okapi-real-estate-dashboard/
├── app/
│   ├── layout.tsx                        # Root layout: ReactQueryProvider + Toaster
│   ├── page.tsx                          # Redirects to /agents
│   ├── globals.css                       # Brand tokens + utility classes
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Dashboard shell: sidebar + header
│   │   ├── dashboard/page.tsx            # Home (counts + quick actions)
│   │   ├── agents/
│   │   │   ├── page.tsx                  # Agents list (Suspense-wrapped)
│   │   │   └── [agentId]/page.tsx        # Agent detail
│   │   ├── agencies/
│   │   │   ├── page.tsx                  # Agencies list (Suspense-wrapped)
│   │   │   └── [agencyId]/page.tsx       # Agency detail
│   │   └── properties/
│   │       ├── page.tsx                  # Properties list (Suspense-wrapped)
│   │       └── [propertyId]/page.tsx     # Property detail
│   └── api/
│       ├── agents/route.ts               # Proxy: GET /agents, POST /agents
│       ├── agents/[agentId]/route.ts     # Proxy: GET, PUT, DELETE /agents/:id
│       ├── agencies/route.ts             # Proxy: GET /agencies, POST /agencies
│       ├── agencies/[agencyId]/route.ts  # Proxy: GET, PUT, DELETE /agencies/:id
│       ├── properties/route.ts           # Proxy: GET /properties, POST /properties
│       └── properties/[propertyId]/route.ts
│
├── components/
│   ├── authentication/                   # Multi-step auth flow components
│   ├── common/                           # Shared: auth-gate, discard, loading, info
│   └── dashboard/
│       ├── header.tsx                    # Top nav bar (breadcrumb + workspace avatar)
│       ├── sidebar/                      # Left sidebar navigation
│       └── main/
│           ├── _common/                  # Shared tables, pagination, data-table wrapper
│           │   ├── table-pagination.tsx
│           │   ├── agents-table.tsx
│           │   ├── agencies-table.tsx
│           │   ├── properties-table.tsx
│           │   └── data-table/
│           │       ├── index.tsx         # Generic TanStack React Table wrapper
│           │       ├── atoms/actions/    # Row dropdown menus (view, delete)
│           │       └── molecules/columns/# Column definitions per entity
│           ├── agents/                   # List, detail, create/delete dialogs
│           ├── agencies/                 # List, detail, create/delete dialogs
│           ├── properties/               # List, detail, create/delete dialogs
│           └── dashboard/               # Home page components
│
├── lib/
│   ├── api.ts                            # Axios instance (no baseURL — relative paths)
│   ├── query-client.tsx                  # ReactQueryProvider wrapper
│   ├── queries/
│   │   ├── agents.ts                     # useAgents, useAgent, useCreateAgent, …
│   │   ├── agencies.ts                   # useAgencies, useAgency, useCreateAgency, …
│   │   └── properties.ts                 # useProperties, useProperty, useCreateProperty, …
│   └── stores/
│       ├── agents.ts                     # Zustand: dialogs, selectedAgent, params
│       ├── agencies.ts                   # Zustand: dialogs, selectedAgency, params
│       └── properties.ts                 # Zustand: dialogs, selectedProperty, params
│
├── types/index.ts                        # Agent, Agency, Property, QueryParams, …
├── constants/index.ts                    # PAGE_SIZE = 10, MAX_DESCRIPTION_LENGTH = 255
└── hooks/
    └── use-mobile.ts                     # useIsMobile (required by shadcn sidebar)
```

---

## Data Flow

### Fetching

All fetching goes through TanStack Query hooks. The Axios client uses relative URLs that hit Next.js API routes, which proxy server-side to `http://localhost:3000`.

```tsx
import { useAgents } from "@/lib/queries/agents";

const { data, isLoading } = useAgents({ page: 1, pageSize: 10, searchName: "John" });

const agents = Array.isArray(data?.data) ? data.data : []; // always guard with Array.isArray
const totalPages = typeof data?.totalPages === "number" ? data.totalPages : null;
```

### Mutations

```tsx
import { useCreateAgent } from "@/lib/queries/agents";

const { mutateAsync: createAgent, isPending } = useCreateAgent();
await createAgent({ name: "John", specialization: "Residential", agency: "XYZ" });
// Automatically invalidates the agents query cache on success
```

### UI State (Zustand)

Zustand manages dialogs, selected items, and search params. **The current page is NOT in Zustand** — it lives in the URL.

```tsx
import { useAgentStore } from "@/lib/stores/agents";

const { dialogs, toggleDialog, selectedAgent, setSelectedAgent, params, setParams } = useAgentStore();
```

---

## Pagination

Pagination is URL-driven. The current page comes from `?queryPage=N`.

```tsx
const urlSearchParams = useSearchParams();
const router = useRouter();

const currentPage = Math.max(1, Number(urlSearchParams.get("queryPage") ?? "1"));

const handlePageChange = (page: number) => {
  const next = new URLSearchParams(urlSearchParams.toString());
  next.set("queryPage", String(page));
  router.push(`?${next.toString()}`, { scroll: false });
};
```

Benefits: refresh keeps you on the same page, back/forward buttons navigate pages, URLs are shareable.

---

## Backend API

The Next.js API routes proxy to `http://localhost:3000`.

| Method | Endpoint                                                              | Description     |
| ------ | --------------------------------------------------------------------- | --------------- |
| GET    | `/agents?page=1&pageSize=10&searchName=...&sortBy=...&sortOrder=asc`  | List agents     |
| POST   | `/agents`                                                             | Create agent    |
| GET    | `/agents/:id`                                                         | Get agent       |
| PUT    | `/agents/:id`                                                         | Update agent    |
| DELETE | `/agents/:id`                                                         | Delete agent    |
| GET    | `/agencies?...`                                                       | List agencies   |
| POST   | `/agencies`                                                           | Create agency   |
| GET    | `/agencies/:id`                                                       | Get agency      |
| PUT    | `/agencies/:id`                                                       | Update agency   |
| DELETE | `/agencies/:id`                                                       | Delete agency   |
| GET    | `/properties?...`                                                     | List properties |
| POST   | `/properties`                                                         | Create property |
| GET    | `/properties/:id`                                                     | Get property    |
| PUT    | `/properties/:id`                                                     | Update property |
| DELETE | `/properties/:id`                                                     | Delete property |

**Response shape:**

```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

Query hooks normalize `meta.total → totalCount`, `meta.totalPages → totalPages`, etc. Components never read from `meta` directly.

---

## Design Tokens

Defined in `app/globals.css`:

| Token              | Value     | Usage                                     |
| ------------------ | --------- | ----------------------------------------- |
| `--brand-blue`     | `#1E63B5` | Primary buttons, active nav, links        |
| `--brand-navy`     | `#0B1D3A` | Sidebar background, dark text             |
| `--brand-gold`     | `#D4AF37` | Accent, sidebar active dot, agency badges |
| `--brand-charcoal` | `#1A1F2B` | Dark card surfaces                        |
| `--brand-gray`     | `#F2F4F7` | Page background                           |

Key utility classes: `bg-gradient-primary`, `card-luxury`, `stat-card`, `table-header-brand`, `text-gold-gradient`.

---

## Adding a New CRUD Entity

1. Add types to `types/index.ts`
2. Create API proxy routes in `app/api/<entity>/route.ts` and `app/api/<entity>/[id]/route.ts`
3. Create TanStack Query hooks in `lib/queries/<entity>.ts`
4. Create Zustand store in `lib/stores/<entity>.ts` (dialogs, selected item, params — NOT page)
5. Create column definitions in `_common/data-table/molecules/columns/<entity>-column.tsx`
6. Create row actions in `_common/data-table/atoms/actions/<entity>-row.tsx`
7. Create table wrapper in `_common/<entity>-table.tsx` — always render `<TablePagination>` when `totalPages != null`
8. Create list and detail components under `components/dashboard/main/<entity>/`
9. Create page files in `app/(dashboard)/<entity>/page.tsx` (wrapped in `<Suspense>`)
10. Add navigation link in `components/dashboard/sidebar/index.tsx`

---

## Key Conventions

| Convention        | Detail                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Suspense required | All client components using `useSearchParams()` must be wrapped in `<Suspense>` at page level |
| Array guard       | Always `Array.isArray(data?.data) ? data.data : []` — never `data?.data ?? []`               |
| Form schemas      | Live in `dialogs/create-*/schema.ts` using Zod v4                                            |
| Toasts            | Use `sonner`: `toast.success(...)`, `toast.error(...)`                                       |
| Null coercion     | Zod `null` values must be coerced to `undefined` before mutations (TypeScript strict mode)   |
| Axios baseURL     | `lib/api.ts` has NO `baseURL` — relative paths hit the Next.js proxy, not the backend directly |
| Nested objects    | Backend may return nested objects (e.g., `agent.agency` as full object). Use resolver helpers in column cells |
