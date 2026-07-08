"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditLogs } from "@/lib/queries/audit-logs";
import { useTranslation } from "@/hooks/use-translation";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN:  "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-600",
};

// Resource label map
const RESOURCE_LABEL: Record<string, string> = {
  property: "Annonce",
  agent:    "Agent",
  agency:   "Agence",
  admin:    "Admin",
};

function actionColor(action: string) {
  return ACTION_COLORS[action.toUpperCase()] ?? "bg-muted text-muted-foreground";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Parse details JSON safely, with regex fallback for truncated records. */
function parseDetails(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    return null;
  } catch {
    // Regex-based extraction for truncated/malformed JSON
    const result: Record<string, unknown> = {};
    const re = /"(\w+)"\s*:\s*"([^"\\]*)"/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(raw)) !== null) {
      result[match[1]] = match[2];
    }
    return Object.keys(result).length > 0 ? result : null;
  }
}

/** Format a Property payload into a readable description. */
function formatPropertyDetails(d: Record<string, unknown>, action: string): string {
  const parts: string[] = [];

  // Category
  const categoryMap: Record<string, string> = {
    apartment: "Appartement", villa: "Villa", studio: "Studio",
    townhouse: "Maison de ville", land: "Terrain", office: "Bureau",
    warehouse: "Entrepôt", retail: "Commerce", duplex: "Duplex", penthouse: "Penthouse",
  };
  const cat = String(d.category ?? d.type ?? "").toLowerCase();
  if (cat && categoryMap[cat]) parts.push(categoryMap[cat]);
  else if (cat) parts.push(cat);

  // Bedrooms
  const beds = d.bedrooms ?? d.rooms;
  if (beds != null && Number(beds) > 0) parts.push(`${beds}ch`);

  // Location
  const suburb = d.suburb ?? d.neighborhood ?? d.city;
  if (suburb) parts.push(String(suburb));

  // Short-term flag
  if (d.isShortTerm === true) parts.push("Court terme");

  // Price
  if (d.pricePerNight != null) {
    parts.push(`$${d.pricePerNight}/nuit`);
  } else if (d.price != null) {
    parts.push(`$${Number(d.price).toLocaleString("fr-FR")}`);
  }

  const base = action === "CREATE" ? "Nouvelle annonce" : action === "DELETE" ? "Annonce supprimée" : "Annonce mise à jour";
  return parts.length ? `${base} — ${parts.join(" · ")}` : base;
}

/** Format an Agent payload. */
function formatAgentDetails(d: Record<string, unknown>, action: string): string {
  const base = action === "CREATE" ? "Nouvel agent" : action === "DELETE" ? "Agent supprimé" : "Agent mis à jour";
  const parts: string[] = [];
  if (d.name)  parts.push(String(d.name));
  if (d.email) parts.push(String(d.email));
  if (d.agentType) {
    const labels: Record<string, string> = {
      AGENCY_OWNER: "Propriétaire d'agence", AGENT: "Agent",
      COMMISSIONNAIRE: "Commissionnaire", OTHER: "Autre",
    };
    parts.push(labels[String(d.agentType)] ?? String(d.agentType));
  }
  if (d.verificationTier === "VERIFIE") parts.push("Vérifié");
  return parts.length ? `${base} — ${parts.join(" · ")}` : base;
}

/** Format an Agency payload. */
function formatAgencyDetails(d: Record<string, unknown>, action: string): string {
  const base = action === "CREATE" ? "Nouvelle agence" : action === "DELETE" ? "Agence supprimée" : "Agence mise à jour";
  const parts: string[] = [];
  if (d.name)       parts.push(String(d.name));
  if (d.email)      parts.push(String(d.email));
  if (d.rccmNumber) parts.push(`RCCM: ${d.rccmNumber}`);
  return parts.length ? `${base} — ${parts.join(" · ")}` : base;
}

/** Convert raw log.details (JSON string) into a human-readable message. */
function formatDetails(resource: string, action: string, rawDetails: string): string {
  // If it doesn't look like JSON, return as-is (already a plain string)
  const trimmed = rawDetails.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return trimmed;

  const d = parseDetails(rawDetails);
  if (!d) return rawDetails; // parse failed, show raw

  // Normalize: lowercase + strip trailing 's' so "properties"→"property", "agents"→"agent"
  const res = resource.toLowerCase().replace(/s$/, "");
  if (res === "property") return formatPropertyDetails(d, action);
  if (res === "agent")    return formatAgentDetails(d, action);
  if (res === "agency")   return formatAgencyDetails(d, action);

  // Fallback: show first meaningful string value
  const first = Object.entries(d).find(([, v]) => typeof v === "string" && (v as string).length < 60);
  return first ? `${res} — ${first[1] as string}` : res;
}

export default function RecentAuditLogs() {
  const t = useTranslation();
  const { data, isLoading } = useAuditLogs({ page: 1, limit: 5 });
  const logs = data?.data ?? [];

  return (
    <Card className="card-luxury rounded-xl h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-4 bg-brand-gold rounded-full" />
          {t.dashboard.recentActivity}
        </CardTitle>
        <Link
          href="/audit-logs"
          className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
        >
          {t.dashboard.viewAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col gap-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
              <div className="h-5 w-14 rounded bg-muted animate-pulse shrink-0" />
              <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t.dashboard.noActivity}
          </p>
        ) : (
          logs.map((log) => {
            const res     = log.resource.toLowerCase().replace(/s$/, "");
            const resLabel = RESOURCE_LABEL[res] ?? log.resource;
            const message = formatDetails(log.resource, log.action, log.details ?? "");
            const actor   = log.admin?.email ? log.admin.email.split("@")[0] : null;
            const cfg     = ACTION_COLORS[log.action.toUpperCase()] ?? "bg-muted text-muted-foreground";

            return (
              <div key={log.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 mt-0.5 ${cfg}`}>
                  {resLabel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{message}</p>
                  {actor && (
                    <p className="text-[11px] text-muted-foreground">par {actor}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                  {formatTime(log.createdAt)}
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
