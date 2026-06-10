"use client";

import { Building2, Home, Users } from "lucide-react";
import { useAgents } from "@/lib/queries/agents";
import { useAgencies } from "@/lib/queries/agencies";
import { useProperties } from "@/lib/queries/properties";
import { useTranslation } from "@/hooks/use-translation";

function EntitiesCount() {
  const t = useTranslation();
  const { data: agentsData } = useAgents({ page: 1, pageSize: 1 });
  const { data: agenciesData } = useAgencies({ page: 1, pageSize: 1 });
  const { data: propertiesData } = useProperties({ page: 1, pageSize: 1 });

  const STAT_CONFIG = [
    {
      label: t.nav.agents,
      key: "agents" as const,
      icon: Users,
      iconBg: "bg-brand-blue/10",
      iconColor: "text-brand-blue",
      borderColor: "border-t-brand-blue",
    },
    {
      label: t.nav.agencies,
      key: "agencies" as const,
      icon: Building2,
      iconBg: "bg-brand-gold/10",
      iconColor: "text-brand-gold",
      borderColor: "border-t-brand-gold",
    },
    {
      label: t.nav.properties,
      key: "properties" as const,
      icon: Home,
      iconBg: "bg-brand-navy/10",
      iconColor: "text-brand-navy",
      borderColor: "border-t-brand-navy",
    },
  ];

  const values = {
    agents: typeof agentsData?.totalCount === "number" ? agentsData.totalCount : "–",
    agencies: typeof agenciesData?.totalCount === "number" ? agenciesData.totalCount : "–",
    properties: typeof propertiesData?.totalCount === "number" ? propertiesData.totalCount : "–",
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {STAT_CONFIG.map(({ label, key, icon: Icon, iconBg, iconColor, borderColor }) => (
          <div key={key} className={`stat-card border-t-2 ${borderColor}`}>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {label}
                </span>
                <div className={`${iconBg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-foreground leading-none">
                  {values[key]}
                </span>
                <span className="text-xs text-muted-foreground mb-0.5">{t.dashboard.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EntitiesCount;
