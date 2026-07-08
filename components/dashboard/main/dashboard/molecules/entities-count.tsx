"use client";

import { AlertCircle, Building2, Home, Users } from "lucide-react";
import Link from "next/link";
import { useAgents, usePendingAgentsCount } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { useProperties } from "@/lib/queries/properties";
import { useTranslation } from "@/hooks/use-translation";

function EntitiesCount() {
  const t = useTranslation();
  const { data: agentsData } = useAgents({ page: 1, pageSize: 1 });
  const { data: agenciesData } = useAgencies({ page: 1, pageSize: 1 });
  const { data: propertiesData } = useProperties({ page: 1, pageSize: 1 });
  const { data: pendingCount } = usePendingAgentsCount();

  const agentTotal    = typeof agentsData?.totalCount     === "number" ? agentsData.totalCount     : null;
  const agencyTotal   = typeof agenciesData?.totalCount   === "number" ? agenciesData.totalCount   : null;
  const propertyTotal = typeof propertiesData?.totalCount === "number" ? propertiesData.totalCount : null;
  const pending       = typeof pendingCount === "number" ? pendingCount : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-xl font-semibold leading-normal">
          {t.dashboard.portfolioOverview}
        </h2>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
          {t.dashboard.live}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Agents */}
        <Link href="/agents" className="block group">
          <div className="stat-card border-t-2 border-t-brand-blue h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.nav.agents}</span>
                <div className="bg-brand-blue/10 p-2 rounded-lg">
                  <Users className="w-4 h-4 text-brand-blue" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {agentTotal ?? "–"}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">{t.dashboard.total}</span>
              </div>
              {pending !== null && pending > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {pending} en attente d&apos;approbation
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground/60">Aucun en attente</span>
              )}
            </div>
          </div>
        </Link>

        {/* Agencies */}
        <Link href="/agencies" className="block group">
          <div className="stat-card border-t-2 border-t-brand-gold h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.nav.agencies}</span>
                <div className="bg-brand-gold/10 p-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-brand-gold" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {agencyTotal ?? "–"}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">{t.dashboard.total}</span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">Toutes vérifiées</span>
            </div>
          </div>
        </Link>

        {/* Properties */}
        <Link href="/properties" className="block group">
          <div className="stat-card border-t-2 border-t-brand-navy h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.nav.properties}</span>
                <div className="bg-brand-navy/10 p-2 rounded-lg">
                  <Home className="w-4 h-4 text-brand-navy" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {propertyTotal ?? "–"}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">{t.dashboard.total}</span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">Annonces actives</span>
            </div>
          </div>
        </Link>

        {/* Pending approvals */}
        <Link href="/agents/pending" className="block group">
          <div className={`stat-card border-t-2 h-full transition-shadow hover:shadow-md cursor-pointer ${
            pending && pending > 0 ? "border-t-red-500" : "border-t-muted"
          }`}>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">En attente</span>
                <div className={`p-2 rounded-lg ${pending && pending > 0 ? "bg-red-100" : "bg-muted"}`}>
                  <AlertCircle className={`w-4 h-4 ${pending && pending > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                </div>
              </div>
              <div>
                <span className={`text-3xl font-bold leading-none ${
                  pending && pending > 0 ? "text-red-500" : "text-foreground"
                }`}>
                  {pending ?? "–"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">approbations agents</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default EntitiesCount;
