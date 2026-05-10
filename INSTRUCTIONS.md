# Okapi Real Estate Dashboard — Implementation Guide

## Architecture Overview

This is a Next.js 16 (App Router) dashboard for managing real estate **Agents**, **Agencies**, and **Properties** with full CRUD operations.

### Tech Stack

| Layer        | Technology                                               |
| ------------ | -------------------------------------------------------- |
| Framework    | Next.js 16.2.6 (App Router, Turbopack)                   |
| UI           | React 19, Tailwind CSS v4, shadcn/ui                     |
| Server State | TanStack Query (`@tanstack/react-query`)                 |
| Client State | Zustand (dialogs, selected items, search params)         |
| HTTP Client  | Axios (relative URLs → Next.js API routes → backend)     |
| Forms        | React Hook Form + Zod v4                                 |
| Backend      | `http://localhost:3000` (proxied via Next.js API routes) |

---

## Directory Structure

```
app/
  layout.tsx                      ← Root layout: ReactQueryProvider + Toaster + fonts
  page.tsx                        ← Redirects to /agents
  (dashboard)/
    layout.tsx                    ← Dashboard shell: sidebar + header
    page.tsx                      ← Dashboard home (counts + quick actions)
    agents/
      page.tsx                    ← Agents list (Suspense-wrapped)
      [agentId]/page.tsx          ← Agent detail page
    agencies/
      page.tsx                    ← Agencies list (Suspense-wrapped)
      [agencyId]/page.tsx         ← Agency detail page
    properties/
      page.tsx                    ← Properties list (Suspense-wrapped)
      [propertyId]/page.tsx       ← Property detail page
  api/
    agents/route.ts               ← Proxy: GET /agents, POST /agents
    agents/[agentId]/route.ts     ← Proxy: GET, PUT, DELETE /agents/:id
    agencies/route.ts             ← Proxy: GET /agencies, POST /agencies
    agencies/[agencyId]/route.ts  ← Proxy: GET, PUT, DELETE /agencies/:id
    properties/route.ts           ← Proxy: GET /properties, POST /properties
    properties/[propertyId]/route.ts ← Proxy: GET, PUT, DELETE /properties/:id

lib/
  api.ts                          ← Axios instance (no baseURL → relative paths)
  query-client.tsx                ← ReactQueryProvider wrapper
  queries/
    agents.ts                     ← useAgents, useAgent, useCreateAgent, useUpdateAgent, useDeleteAgent
    agencies.ts                   ← useAgencies, useAgency, useCreateAgency, useUpdateAgency, useDeleteAgency
    properties.ts                 ← useProperties, useProperty, useCreateProperty, useUpdateProperty, useDeleteProperty
  stores/
    agents.ts                     ← Zustand: selectedAgent, dialogs, search params
    agencies.ts                   ← Zustand: selectedAgency, dialogs, search params
    properties.ts                 ← Zustand: selectedProperty, dialogs, search params

components/dashboard/main/
  _common/
    table-pagination.tsx          ← Shared pagination bar (always visible at table bottom)
    agents-table.tsx              ← Agents data table + pagination
    agencies-table.tsx            ← Agencies data table + pagination
    properties-table.tsx          ← Properties data table + pagination
    data-table/index.tsx          ← Generic TanStack React Table wrapper
    data-table/atoms/actions/
      agent-row.tsx               ← Agent row dropdown (view, delete)
      agency-row.tsx              ← Agency row dropdown (view, delete)
      property-row.tsx            ← Property row dropdown (view, delete)
    data-table/molecules/columns/
      agent-column.tsx            ← Column definitions for Agent
      agency-column.tsx           ← Column definitions for Agency
      property-column.tsx         ← Column definitions for Property
  agents/
    index.tsx                     ← Agents list (URL-driven pagination + Zustand)
    agent/index.tsx               ← Agent detail view
    dialogs/create-agent/         ← AddAgent form (Zod + react-hook-form + useCreateAgent)
    dialogs/delete-agent/         ← DeleteAgent confirmation (useDeleteAgent)
  agencies/
    index.tsx                     ← Agencies list
    agency/index.tsx              ← Agency detail view
    dialogs/create-agency/        ← AddAgency form
    dialogs/delete-agency/        ← DeleteAgency confirmation
  properties/
    index.tsx                     ← Properties list
    property/index.tsx            ← Property detail view
    dialogs/create-agent/         ← AddProperty form (type, category, price, location)
    dialogs/delete-agent/         ← DeleteProperty confirmation
  dashboard/
    index.tsx                     ← Dashboard home (counts + quick actions)
    molecules/entities-count.tsx  ← Live portfolio stats via TanStack Query
    molecules/quick-actions.tsx   ← Shortcuts to create Agent/Agency/Property
  header.tsx                      ← Top nav bar (breadcrumb + workspace avatar)
  sidebar/index.tsx               ← Left sidebar navigation

hooks/
  use-mobile.ts                   ← useIsMobile (required by shadcn sidebar)

types/index.ts                    ← Agent, Agency, Property, QueryParams, SEARCH_TYPE, etc.
constants/index.ts                ← PAGE_SIZE = 10, MAX_DESCRIPTION_LENGTH = 255
```

---

## Data Flow

### Fetching Data

All fetching goes through TanStack Query hooks in `lib/queries/`. The axios client uses **relative URLs** so requests hit the Next.js API routes (which proxy server-side to `http://localhost:3000`).

```tsx
import { useAgents } from "@/lib/queries/agents";

const { data, isLoading } = useAgents({
  page: 1,
  pageSize: 10,
  searchName: "John",
});

const agents = Array.isArray(data?.data) ? data.data : []; // always an array
const totalPages =
  typeof data?.totalPages === "number" ? data.totalPages : null;
const totalCount =
  typeof data?.totalCount === "number" ? data.totalCount : undefined;
```

> **Safety rule:** Always use `Array.isArray(data?.data)` instead of `data?.data ?? []`.  
> The backend may return a nested object or a different shape — the guard prevents "Objects are not valid as a React child" crashes.

### Mutating Data

```tsx
import { useCreateAgent, useDeleteAgent } from "@/lib/queries/agents";

const { mutateAsync: createAgent, isPending } = useCreateAgent();
await createAgent({
  name: "John",
  specialization: "Residential",
  agency: "XYZ",
});
// Automatically invalidates the agents query cache on success
```

### UI State (Zustand)

Zustand manages **dialogs, selected items, and search params**. The **current page is NOT in Zustand** — it lives in the URL (`?queryPage=N`).

```tsx
import { useAgentStore } from "@/lib/stores/agents";

const {
  dialogs,
  toggleDialog,
  selectedAgent,
  setSelectedAgent,
  params,
  setParams,
} = useAgentStore();
```

---

## Pagination

### How it works

Pagination is **URL-driven**. The current page is read from `?queryPage=N` in the URL search params. Changing pages updates the URL via `router.push`, which triggers a re-render and a new TanStack Query fetch.

```tsx
// In each list index component (agents/index.tsx etc.)
const urlSearchParams = useSearchParams();
const router = useRouter();

// Page always comes from the URL — never from Zustand
const currentPage = Math.max(
  1,
  Number(urlSearchParams.get("queryPage") ?? "1"),
);

const { data } = useAgents({
  ...params,
  page: currentPage,
  pageSize: PAGE_SIZE,
});

const handlePageChange = (page: number) => {
  const next = new URLSearchParams(urlSearchParams.toString());
  next.set("queryPage", String(page));
  router.push(`?${next.toString()}`, { scroll: false });
};
```

**Benefits of URL-based pagination:**

- Refreshing the page keeps you on the same page
- Browser Back/Forward buttons navigate between pages
- Sharing a URL preserves the exact page
- Sort changes and search resets automatically set `?queryPage=1`

### `TablePagination` component

Located at `components/dashboard/main/_common/table-pagination.tsx`.

**Always rendered** at the bottom of every table once `totalPages` is not null (i.e., the first data response has arrived). It shows:

| State                          | Left side                     | Right side                |
| ------------------------------ | ----------------------------- | ------------------------- |
| Single page (`totalPages = 1`) | "Showing 1–10 of 8 agents"    | "All agents on one page"  |
| Multiple pages                 | "Showing 11–20 of 47 agents"  | Prev · 1 `2` 3 … 5 · Next |
| No results (`totalCount = 0`)  | "No agents match your search" | —                         |

**Props:**

```tsx
<TablePagination
  currentPage={number}          // current active page
  totalPages={number}           // total number of pages from API
  totalCount={number | undefined} // total record count for "Showing X-Y of Z"
  onPageChange={(page) => void}  // called when user clicks a page button
  entityLabel="agents"           // used in the count label and empty message
/>
```

**Usage in table wrappers:**

```tsx
// Always show once data has loaded (totalPages != null)
{
  totalPages != null && (
    <TablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
      entityLabel="agents"
    />
  );
}
```

---

## Design System

Brand tokens (defined in `app/globals.css`):

| Token              | Value     | Usage                                     |
| ------------------ | --------- | ----------------------------------------- |
| `--brand-blue`     | `#1E63B5` | Primary buttons, active nav, links        |
| `--brand-navy`     | `#0B1D3A` | Sidebar background, dark text             |
| `--brand-gold`     | `#D4AF37` | Accent, sidebar active dot, agency badges |
| `--brand-charcoal` | `#1A1F2B` | Dark card surfaces                        |
| `--brand-gray`     | `#F2F4F7` | Page background                           |

Key utility classes:

| Class                 | Description                                  |
| --------------------- | -------------------------------------------- |
| `bg-gradient-primary` | Blue gradient for CTA buttons                |
| `card-luxury`         | White card with subtle gold border glow      |
| `stat-card`           | Card with colored top border + hover lift    |
| `table-header-brand`  | Table header with navy tint + gold underline |
| `text-gold-gradient`  | Gold shimmer text for hero headings          |

---

## Backend API Contract

The Next.js API routes proxy to `http://localhost:3000`. Expected endpoints:

| Method | Path                                                                 | Description     |
| ------ | -------------------------------------------------------------------- | --------------- |
| GET    | `/agents?page=1&pageSize=10&searchName=...&sortBy=...&sortOrder=asc` | List agents     |
| POST   | `/agents`                                                            | Create agent    |
| GET    | `/agents/:id`                                                        | Get agent       |
| PUT    | `/agents/:id`                                                        | Update agent    |
| DELETE | `/agents/:id`                                                        | Delete agent    |
| GET    | `/agencies?...`                                                      | List agencies   |
| POST   | `/agencies`                                                          | Create agency   |
| GET    | `/agencies/:id`                                                      | Get agency      |
| PUT    | `/agencies/:id`                                                      | Update agency   |
| DELETE | `/agencies/:id`                                                      | Delete agency   |
| GET    | `/properties?...`                                                    | List properties |
| POST   | `/properties`                                                        | Create property |
| GET    | `/properties/:id`                                                    | Get property    |
| PUT    | `/properties/:id`                                                    | Update property |
| DELETE | `/properties/:id`                                                    | Delete property |

Actual paginated list response from the backend:

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

> **Response normalization:** The query hooks (`useAgents`, `useAgencies`, `useProperties`) normalize this into a flat `PaginatedResponse<T>` before returning:
>
> | Backend field | Normalized to |
> |---|---|
> | `meta.total` | `totalCount` |
> | `meta.limit` | `pageSize` |
> | `meta.page` | `page` |
> | `meta.totalPages` | `totalPages` |
>
> All list components and `TablePagination` consume the normalized shape — they never read from `meta` directly. The fallback pattern `resp.meta?.page ?? resp.page` also handles flat-format responses if the backend shape changes.

---

## Key Conventions

| Convention            | Detail                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Suspense required** | All client components using `useSearchParams()` must be wrapped in `<Suspense>` at the page level                                                                                                                                                             |
| **Form schemas**      | Live in `dialogs/create-*/schema.ts` using Zod v4                                                                                                                                                                                                             |
| **Toasts**            | Use `sonner`: `toast.success(...)`, `toast.error(...)`                                                                                                                                                                                                        |
| **Pagination**        | URL-driven (`?queryPage=N`); always visible at table bottom once data loads                                                                                                                                                                                   |
| **Sorting**           | Server-side: pass `sortBy` and `sortOrder` to query params; resets to page 1                                                                                                                                                                                  |
| **Search**            | Server-side: pass `searchName` or `search` via Zustand `params`; resets to page 1                                                                                                                                                                             |
| **Null coercion**     | Zod `null` values must be coerced to `undefined` before mutations (TypeScript strict mode)                                                                                                                                                                    |
| **Nested objects**    | Backend may return nested objects (e.g., `agent.agency` as a full Agency object). Always use `resolveAgencyName(val)` helpers in column cells — never render a raw field directly as JSX                                                                      |
| **Array guard**       | Always use `Array.isArray(data?.data) ? data.data : []` — never `data?.data ?? []`                                                                                                                                                                            |
| **Response shape**    | Backend returns `{ data, meta: { total, page, limit, totalPages } }`. Query hooks normalize this to `PaginatedResponse<T>` (`totalCount`, `pageSize`, etc.) — never read from `meta` outside of `lib/queries/`. |
| **Axios baseURL**     | `lib/api.ts` has NO `baseURL`. Relative paths (`/api/agents`) resolve to the Next.js dev server, which proxies to the backend. Setting `baseURL: "http://localhost:3000"` would bypass the proxy and hit the backend directly (causing 404s on `/api/` paths) |

---

## Adding a New CRUD Entity

1. Add types to `types/index.ts`
2. Create API proxy routes in `app/api/<entity>/route.ts` and `app/api/<entity>/[id]/route.ts`
3. Create TanStack Query hooks in `lib/queries/<entity>.ts`
4. Create Zustand store in `lib/stores/<entity>.ts` (dialogs, selected item, search params — NOT page)
5. Create column definitions in `_common/data-table/molecules/columns/<entity>-column.tsx`
   - Use `safeString()` / `safeNumber()` helpers for all cell values
   - Use `resolveXName()` helpers for any field that could be a nested object
6. Create row actions in `_common/data-table/atoms/actions/<entity>-row.tsx`
7. Create table wrapper in `_common/<entity>-table.tsx` — always render `<TablePagination>` when `totalPages != null`
8. Create list component in `<entity>/index.tsx`
   - Use `useSearchParams` + `useRouter` for URL-driven pagination
   - Derive `currentPage` from `?queryPage=N`
   - Pass `totalCount` to the table wrapper for the "Showing X–Y of Z" label
9. Create form dialogs (create / delete / edit)
10. Create detail view in `<entity>/property/index.tsx` (or similar)
11. Create page files in `app/(dashboard)/<entity>/page.tsx` (with Suspense)
12. Add navigation link in `components/dashboard/sidebar/index.tsx`

---

## Running the Project

```bash
# Install dependencies
npm install

# Start development server (frontend on :3001 if backend is on :3000)
npm run dev

# Build for production
npm run build
```

Make sure your backend is running at `http://localhost:3000` before starting.
