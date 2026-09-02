"use client";

import { AlertCircle, Building2, CreditCard, Home, Rocket, Star, Users } from "lucide-react";
import Link from "next/link";
import { useAgents, usePendingAgentsCount } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { useProperties } from "@/lib/queries/properties";
import { useRevenueSummary } from "@/lib/queries/subscriptions";
import { useUsersCount } from "@/lib/queries/users";
import { useTranslation } from "@/hooks/use-translation";

function EntitiesCount() {
  const t = useTranslation();
  const { data: agentsData } = useAgents({ page: 1, pageSize: 1 });
  const { data: agenciesData } = useAgencies({ page: 1, pageSize: 1 });
  const { data: propertiesData } = useProperties({ page: 1, pageSize: 1 });
  const { data: pendingCount } = usePendingAgentsCount();
  const { data: revenue } = useRevenueSummary();
  const { data: usersCount } = useUsersCount();

  const agentTotal    = typeof agentsData?.totalCount     === "number" ? agentsData.totalCount     : null;
  const agencyTotal   = typeof agenciesData?.totalCount   === "number" ? agenciesData.totalCount   : null;
  const propertyTotal = typeof propertiesData?.totalCount === "number" ? propertiesData.totalCount : null;
  const pending       = typeof pendingCount === "number" ? pendingCount : null;
  const userTotal     = typeof usersCount === "number" ? usersCount : null;

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Users */}
        <div className="stat-card border-t-2 border-t-teal-500 h-full">
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Utilisateurs</span>
              <div className="bg-teal-50 p-2 rounded-lg">
                <Users className="w-4 h-4 text-teal-500" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground leading-none">
                {userTotal ?? "–"}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5">{t.dashboard.total}</span>
            </div>
            <span className="text-[11px] text-muted-foreground/60">comptes enregistrés</span>
          </div>
        </div>

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

      {/* Revenue KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Monthly revenue */}
        <Link href="/subscriptions/historique" className="block group">
          <div className="stat-card border-t-2 border-t-emerald-500 h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.subscriptions.revenueThisMonth}</span>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {revenue ? `$${revenue.monthlyRevenue}` : "–"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">ce mois-ci</span>
            </div>
          </div>
        </Link>

        {/* Active Pro agents */}
        <Link href="/subscriptions/agents?status=active" className="block group">
          <div className="stat-card border-t-2 border-t-blue-500 h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.subscriptions.revenueProAgents}</span>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Star className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {revenue?.activeProAgents ?? "–"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">plan Pro actif</span>
            </div>
          </div>
        </Link>

        {/* Active agencies */}
        <Link href="/subscriptions/agences" className="block group">
          <div className="stat-card border-t-2 border-t-purple-500 h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.subscriptions.revenueAgencies}</span>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {revenue?.activeAgencyAgents ?? "–"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">plan Agence actif</span>
            </div>
          </div>
        </Link>

        {/* Active boosts */}
        <Link href="/boosts" className="block group">
          <div className="stat-card border-t-2 border-t-amber-500 h-full transition-shadow hover:shadow-md cursor-pointer">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t.subscriptions.revenueBoosts}</span>
                <div className="bg-amber-50 p-2 rounded-lg">
                  <Rocket className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground leading-none">
                  {revenue?.activeBoosts ?? "–"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground/60">boosts confirmés</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default EntitiesCount;
