"use client";

import { Building2, MessageCircle, Star, X } from "lucide-react";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import {
  type ActiveAgencySubscription,
  useActiveAgencySubscriptions,
} from "@/lib/queries/subscriptions";

// ── Status helpers ────────────────────────────────────────────────────────────

function getStatus(agent: ActiveAgencySubscription): "active" | "expiring" | "expired" {
  if (!agent.subscriptionEndsAt) return "expired";
  const end = new Date(agent.subscriptionEndsAt);
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60_000);
  if (end <= now) return "expired";
  if (end <= in7days) return "expiring";
  return "active";
}

function StatusBadge({ agent }: { agent: ActiveAgencySubscription }) {
  const t = useTranslation().subscriptions;
  const status = getStatus(agent);
  const map = {
    active:   { label: t.statusActive,   className: "bg-emerald-100 text-emerald-700" },
    expiring: { label: t.statusExpiring, className: "bg-amber-100 text-amber-700" },
    expired:  { label: t.statusExpired,  className: "bg-red-100 text-red-600" },
  };
  const { label, className } = map[status];
  return <Badge className={`text-xs font-semibold ${className}`}>{label}</Badge>;
}

// ── Agency row ────────────────────────────────────────────────────────────────

function AgencyRow({ agent }: { agent: ActiveAgencySubscription }) {
  const t = useTranslation().subscriptions;
  const latestSub = agent.subscriptionRequests[0];

  const endsAt = agent.subscriptionEndsAt
    ? new Date(agent.subscriptionEndsAt).toLocaleDateString("fr-FR", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  const whatsappHref = agent.whatsappNumber
    ? `https://wa.me/${agent.whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Agency */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {agent.agency?.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">{agent.agency?.id ?? ""}</p>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.email}</p>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-0.5"
            >
              <MessageCircle className="w-3 h-3" />
              {t.actionWhatsApp}
            </a>
          )}
        </div>
      </td>

      {/* Plan badge */}
      <td className="px-4 py-3">
        <Badge className="text-xs font-semibold bg-purple-100 text-purple-700 inline-flex items-center gap-1">
          <Star className="w-3 h-3" />
          Agency
        </Badge>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge agent={agent} />
      </td>

      {/* Expires */}
      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{endsAt}</td>

      {/* Amount */}
      <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
        {latestSub ? `$${latestSub.amount}` : "—"}
      </td>

      {/* Agents */}
      <td className="px-4 py-3 text-sm text-center">
        {agent.agency?.agentCount ?? 0}
      </td>

      {/* Listings */}
      <td className="px-4 py-3 text-sm text-center">
        {agent.agency?.listingCount ?? 0}
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AgencesPage() {
  const t = useTranslation().subscriptions;
  const { data: agencies = [], isLoading } = useActiveAgencySubscriptions();

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.agencesTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.agencesSubtitle}</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <Loading label={t.agencesLoading} />
      ) : agencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <X className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">{t.agencesEmpty}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colAgency}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colOwner}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colPlan}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colEnds}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colAmount}</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colAgents}</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colListings}</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <AgencyRow key={agency.id} agent={agency} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground px-4 py-2 border-t border-border">
            {agencies.length} agence{agencies.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
