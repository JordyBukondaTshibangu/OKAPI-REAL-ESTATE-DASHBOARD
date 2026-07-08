"use client";

import { useCallback, useState } from "react";
import {
  Building2,
  CalendarDays,
  FileText,
  Home,
  KeyRound,
  Search,
  User,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TablePagination } from "@/components/dashboard/main/_common/table-pagination";
import { useAuditLogs } from "@/lib/queries/audit-logs";
import { useAuditLogStore } from "@/lib/stores/audit-logs";
import { useTranslation } from "@/hooks/use-translation";
import { PAGE_SIZE } from "@/constants";

// ── Action styling ────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
  CREATE: { label: "Création",     className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  UPDATE: { label: "Modification", className: "bg-blue-50 text-blue-700 border-blue-200" },
  DELETE: { label: "Suppression",  className: "bg-red-50 text-red-700 border-red-200" },
  LOGIN:  { label: "Connexion",    className: "bg-purple-50 text-purple-700 border-purple-200" },
  LOGOUT: { label: "Déconnexion",  className: "bg-gray-100 text-gray-600 border-gray-200" },
};

function actionCfg(action: string) {
  return ACTION_CONFIG[action.toUpperCase()] ?? { label: action, className: "bg-muted text-muted-foreground border-border" };
}

// ── Resource icons ────────────────────────────────────────────────────────────

function ResourceIcon({ resource }: { resource: string }) {
  const r = resource.toLowerCase().replace(/s$/, "");
  const cls = "size-3.5 shrink-0";
  if (r === "property")  return <Home className={`${cls} text-brand-gold`} />;
  if (r === "agent")     return <User className={`${cls} text-brand-blue`} />;
  if (r === "agency")    return <Building2 className={`${cls} text-emerald-600`} />;
  if (r === "admin" || r === "auth/admin") return <KeyRound className={`${cls} text-purple-600`} />;
  return <FileText className={`${cls} text-muted-foreground`} />;
}

// ── Details formatting ────────────────────────────────────────────────────────

function parseDetails(raw: string): Record<string, unknown> | null {
  // Try full parse first
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === "object") return p as Record<string, unknown>;
  } catch {
    // Fall through to regex extraction for truncated JSON
  }
  // Regex-based extraction for truncated/malformed JSON — picks scalar string values
  const result: Record<string, unknown> = {};
  const re = /"(\w+)"\s*:\s*"([^"\\]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    result[match[1]] = match[2];
  }
  return Object.keys(result).length > 0 ? result : null;
}

function formatPropertyDetails(d: Record<string, unknown>, action: string): string {
  const categoryMap: Record<string, string> = {
    apartment: "Appartement", villa: "Villa", studio: "Studio",
    townhouse: "Maison de ville", land: "Terrain", office: "Bureau",
    warehouse: "Entrepôt", retail: "Commerce", duplex: "Duplex", penthouse: "Penthouse",
  };
  const parts: string[] = [];
  const cat = String(d.category ?? d.type ?? "").toLowerCase();
  if (cat && categoryMap[cat]) parts.push(categoryMap[cat]);
  const beds = d.bedrooms ?? d.rooms;
  if (beds != null && Number(beds) > 0) parts.push(`${beds} ch.`);
  const loc = d.suburb ?? d.neighborhood ?? d.city ?? d.address;
  if (loc) parts.push(String(loc));
  if (d.isShortTerm === true) parts.push("Court terme");
  if (d.pricePerNight != null) parts.push(`$${d.pricePerNight}/nuit`);
  else if (d.price != null) parts.push(`$${Number(d.price).toLocaleString("fr-FR")}`);

  const verb = action === "CREATE" ? "Nouvelle annonce" : action === "DELETE" ? "Annonce supprimée" : "Annonce modifiée";
  return parts.length ? `${verb} — ${parts.join(" · ")}` : verb;
}

function formatAgentDetails(d: Record<string, unknown>, action: string): string {
  const verb = action === "CREATE" ? "Nouvel agent" : action === "DELETE" ? "Agent supprimé" : "Agent modifié";
  const parts: string[] = [];
  if (d.name)  parts.push(String(d.name));
  if (d.email) parts.push(String(d.email));
  if (d.agentType) {
    const typeLabels: Record<string, string> = {
      AGENCY_OWNER: "Propriétaire d'agence", AGENT: "Agent",
      COMMISSIONNAIRE: "Commissionnaire", OTHER: "Autre",
    };
    parts.push(typeLabels[String(d.agentType)] ?? String(d.agentType));
  }
  if (d.verificationTier === "VERIFIE") parts.push("Vérifié");
  if (d.rentalFocus) {
    const fl: Record<string, string> = { LONG_TERM: "Longue durée", SHORT_TERM: "Courte durée", BOTH: "Les deux" };
    parts.push(fl[String(d.rentalFocus)] ?? "");
  }
  return parts.length ? `${verb} — ${parts.join(" · ")}` : verb;
}

function formatAgencyDetails(d: Record<string, unknown>, action: string): string {
  const verb = action === "CREATE" ? "Nouvelle agence" : action === "DELETE" ? "Agence supprimée" : "Agence modifiée";
  const parts: string[] = [];
  if (d.name)       parts.push(String(d.name));
  if (d.email)      parts.push(String(d.email));
  if (d.rccmNumber) parts.push(`RCCM: ${d.rccmNumber}`);
  return parts.length ? `${verb} — ${parts.join(" · ")}` : verb;
}

function formatDetails(resource: string, action: string, rawDetails?: string): string {
  if (!rawDetails) return "–";
  const trimmed = rawDetails.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return trimmed;

  const d = parseDetails(rawDetails);
  if (!d) return rawDetails;

  const res = resource.toLowerCase().replace(/s$/, "");
  if (res === "property") return formatPropertyDetails(d, action);
  if (res === "agent")    return formatAgentDetails(d, action);
  if (res === "agency")   return formatAgencyDetails(d, action);

  // Fallback: first short string value
  const first = Object.entries(d).find(([, v]) => typeof v === "string" && (v as string).length < 80);
  return first ? `${res} — ${String(first[1])}` : res;
}

function normalizeResource(resource: string): string {
  const r = resource.toLowerCase().replace(/s$/, "");
  const map: Record<string, string> = {
    property: "Annonce",
    agent:    "Agent",
    agency:   "Agence",
    admin:    "Admin",
    "auth/admin": "Authentification",
    "auth/agent": "Agent",
    unknown:  "–",
  };
  return map[r] ?? resource;
}

// ── Date formatting ───────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function AuditLogsView() {
  const t = useTranslation();
  const al = t.auditLogs;
  const { params, currentPage, setParams, setCurrentPage } = useAuditLogStore();

  const [searchDraft, setSearchDraft] = useState(params.search ?? "");
  const [dateFrom, setDateFrom]       = useState(params.dateFrom ?? "");
  const [dateTo, setDateTo]           = useState(params.dateTo ?? "");

  const { data, isLoading, isFetching } = useAuditLogs({
    ...params,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const applyFilters = useCallback(() => {
    setParams({
      search:   searchDraft.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo:   dateTo   || undefined,
    });
  }, [searchDraft, dateFrom, dateTo, setParams]);

  function clearFilters() {
    setSearchDraft(""); setDateFrom(""); setDateTo("");
    setParams({ search: undefined, dateFrom: undefined, dateTo: undefined });
  }

  const hasFilters = Boolean(params.search || params.dateFrom || params.dateTo);
  const logs       = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{al.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{al.subtitle}</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border bg-card">
        <div className="flex flex-col gap-1.5 flex-1 min-w-48">
          <label className="text-xs font-medium text-muted-foreground">{al.filterSearch}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder={al.searchPlaceholder}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> {al.filterFrom}
          </label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> {al.filterTo}
          </label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={applyFilters} className="bg-gradient-primary">{al.apply}</Button>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> {al.clear}
            </Button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          {params.search   && <Badge variant="outline" className="text-xs gap-1">{al.chipSearch}: {params.search}</Badge>}
          {params.dateFrom && <Badge variant="outline" className="text-xs gap-1">{al.chipFrom}: {params.dateFrom}</Badge>}
          {params.dateTo   && <Badge variant="outline" className="text-xs gap-1">{al.chipTo}: {params.dateTo}</Badge>}
        </div>
      )}

      {/* Log list */}
      <div className="rounded-xl border bg-card overflow-hidden">

        {/* Column headers */}
        <div className="grid grid-cols-[160px_110px_120px_1fr_180px] gap-0 border-b bg-muted/40 px-4 py-2.5">
          {["Heure", "Action", "Ressource", "Détails", "Effectué par"].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {isLoading || isFetching ? (
          <div className="flex flex-col">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[160px_110px_120px_1fr_180px] gap-0 px-4 py-3.5 border-b last:border-0">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-4 rounded bg-muted animate-pulse mr-4" />
                ))}
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-16 text-center text-muted-foreground text-sm">
            {al.noLogsFound}{hasFilters ? al.noLogsFiltered : ""}
          </div>
        ) : (
          <div className="flex flex-col">
            {logs.map((log, idx) => {
              const cfg     = actionCfg(log.action);
              const message = formatDetails(log.resource, log.action, log.details ?? "");
              const actor   = log.admin?.email ?? null;
              const actorName = actor ? actor.split("@")[0] : null;

              return (
                <div key={log.id}>
                  <div className="grid grid-cols-[160px_110px_120px_1fr_180px] gap-0 px-4 py-3.5 hover:bg-muted/20 transition-colors items-start">

                    {/* Time */}
                    <div className="flex flex-col gap-0.5 pr-3">
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {formatDate(log.createdAt)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>

                    {/* Action badge */}
                    <div className="pr-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Resource */}
                    <div className="flex items-center gap-1.5 pr-3">
                      <ResourceIcon resource={log.resource} />
                      <span className="text-sm font-medium text-foreground">
                        {normalizeResource(log.resource)}
                      </span>
                    </div>

                    {/* Details — human readable */}
                    <div className="pr-4 min-w-0">
                      <p className="text-sm text-foreground font-medium leading-snug">
                        {message}
                      </p>
                      {log.resourceId && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                          ID: {log.resourceId}
                        </p>
                      )}
                    </div>

                    {/* Admin */}
                    <div className="flex items-center gap-2">
                      {actorName && (
                        <div
                          className="w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          title={actor ?? ""}
                        >
                          {actorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col gap-0 min-w-0">
                        <span className="text-xs font-medium text-foreground truncate">
                          {actorName ?? "Système"}
                        </span>
                        {actor && (
                          <span className="text-[10px] text-muted-foreground truncate">{actor}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {idx < logs.length - 1 && <Separator className="opacity-40" />}
                </div>
              );
            })}
          </div>
        )}

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={total}
          onPageChange={setCurrentPage}
          entityLabel={al.title.toLowerCase()}
        />
      </div>
    </div>
  );
}
