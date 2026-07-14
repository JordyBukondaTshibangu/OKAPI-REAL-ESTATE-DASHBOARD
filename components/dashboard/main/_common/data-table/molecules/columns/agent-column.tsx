"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  BadgeCheck,
  Building2,
  CircleDot,
  Clock,
  ShieldOff,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/dashboard/main/_common/data-table/atoms/column-header";
import { AgentRowActions } from "@/components/dashboard/main/_common/data-table/atoms/actions/agent-row";
import HighlightText from "@/components/dashboard/main/_common/atoms/highlight-text";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Agent } from "@/types";

export type AgentDialogType = "deleteAgent" | "editAgent";

function safeString(val: unknown): string {
  if (val == null) return "–";
  if (typeof val === "object") return "–";
  return String(val);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic gradient from name string
function getGradient(name: string): string {
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  COMMISSIONNAIRE: "Commissionnaire",
  AGENT:           "Agent",
  AGENCY_OWNER:    "Propriétaire",
  OTHER:           "Autre",
};

function AgentAvatar({ photo, name, gradient }: { photo?: string; name: string; gradient: string }) {
  const [errored, setErrored] = useState(false);
  if (photo && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        onError={() => setErrored(true)}
        className="w-9 h-9 rounded-xl object-cover border border-border/50"
      />
    );
  }
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

const PLAN_CONFIG: Record<string, { label: string; className: string }> = {
  PRO:    { label: "Pro",     className: "bg-blue-50 text-blue-700 border border-blue-200" },
  AGENCY: { label: "Agence", className: "bg-purple-50 text-purple-700 border border-purple-200" },
  FREE:   { label: "Gratuit", className: "bg-muted text-muted-foreground border border-border" },
};

function GracePeriodCell({ graceEndsAt }: { graceEndsAt?: string }) {
  if (!graceEndsAt) return <span className="text-muted-foreground text-xs">–</span>;

  const diffDays = Math.ceil((new Date(graceEndsAt).getTime() - Date.now()) / 86_400_000);
  const formattedDate = new Date(graceEndsAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let badge: React.ReactNode;
  if (diffDays <= 0) {
    badge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold w-fit">
        <CircleDot className="size-3 shrink-0" />
        Expirée
      </span>
    );
  } else if (diffDays <= 30) {
    badge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold w-fit">
        <Clock className="size-3 shrink-0" />
        {diffDays}j restants
      </span>
    );
  } else {
    const months = Math.ceil(diffDays / 30);
    badge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold w-fit">
        <BadgeCheck className="size-3 shrink-0" />
        {months} mois restants
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-fit">{badge}</div>
      </TooltipTrigger>
      <TooltipContent>Expire le {formattedDate}</TooltipContent>
    </Tooltip>
  );
}

export function getAgentsColumns(
  toggleDialog: (key: AgentDialogType, value: boolean) => void,
  setSelectedAgent: (agent: Agent) => void,
  searchParams?: { search?: string; searchName?: string },
): ColumnDef<Agent>[] {
  const nameQuery = searchParams?.searchName ?? "";
  const genericQuery = searchParams?.search ?? "";

  return [
    // ── AGENT (avatar + name + email) ────────────────────────────────────────
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
      cell: ({ row }) => {
        const agent = row.original;
        const isPending = agent.verificationTier === "NON_VERIFIE" && agent.emailVerified === true;
        const gradient = getGradient(agent.name ?? "");

        return (
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="shrink-0">
              <AgentAvatar photo={agent.photo} name={agent.name ?? "?"} gradient={gradient} />
            </div>

            {/* Name + email + badges */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[15px] text-foreground leading-none">
                  <HighlightText
                    text={safeString(agent.name)}
                    query={nameQuery || genericQuery}
                  />
                </span>
                {isPending && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-semibold border border-amber-200 shrink-0">
                    En attente
                  </span>
                )}
                {agent.isSuspended && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-semibold border border-red-200 shrink-0">
                    Suspendu
                  </span>
                )}
              </div>
              <span className="text-[13px] text-muted-foreground truncate leading-none mt-1">
                {agent.email ?? "–"}
                {agent.phoneNumber && (
                  <span className="text-muted-foreground/60"> · {agent.phoneNumber}</span>
                )}
              </span>
            </div>
          </div>
        );
      },
    },

    // ── STATUT (tier + plan) ──────────────────────────────────────────────────
    {
      accessorKey: "verificationTier",
      enableSorting: false,
      header: "Statut",
      cell: ({ row }) => {
        const { verificationTier: tier, plan } = row.original;
        const planCfg = PLAN_CONFIG[plan ?? "FREE"] ?? PLAN_CONFIG.FREE;

        return (
          <div className="flex items-center gap-1.5 flex-wrap w-fit">
            {tier === "VERIFIE" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <BadgeCheck className="size-3.5 shrink-0" />
                Vérifié
              </span>
            ) : tier === "NON_VERIFIE" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                <Clock className="size-3.5 shrink-0" />
                En attente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground text-[11px] font-medium">
                <ShieldOff className="size-3.5 shrink-0" />
                Non vérifié
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold w-fit ${planCfg.className}`}>
              {planCfg.label}
            </span>
          </div>
        );
      },
    },

    // ── TYPE + AGENCE ─────────────────────────────────────────────────────────
    {
      accessorKey: "agentType",
      enableSorting: false,
      header: "Type & Agence",
      cell: ({ row }) => {
        const agent = row.original as any;
        const agentType = agent.agentType ?? null;
        const agencyName =
          typeof agent.agency === "object" && agent.agency !== null
            ? agent.agency.name
            : null;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {agentType ? AGENT_TYPE_LABELS[agentType] ?? agentType : "–"}
            </span>
            {agencyName ? (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Building2 className="size-3 shrink-0" />
                {agencyName}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">Indépendant</span>
            )}
          </div>
        );
      },
    },

    // ── COMMUNES ──────────────────────────────────────────────────────────────
    {
      accessorKey: "communes",
      enableSorting: false,
      header: "Communes",
      cell: ({ row }) => {
        const agent = row.original as any;
        const communes: string[] = agent.communes ?? [];
        if (communes.length === 0) return <span className="text-muted-foreground text-xs">–</span>;
        const [first, ...rest] = communes;
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-foreground">{first}</span>
            {rest.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 cursor-default">
                    +{rest.length}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{rest.join(", ")}</TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },

    // ── PÉRIODE GRATUITE ──────────────────────────────────────────────────────
    {
      accessorKey: "graceEndsAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Période gratuite" />
      ),
      cell: ({ row }) => (
        <GracePeriodCell graceEndsAt={(row.original as any).graceEndsAt} />
      ),
    },

    // ── DEALS ─────────────────────────────────────────────────────────────────
    {
      accessorKey: "closedDeals",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deals" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <TrendingUp className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {row.original.closedDeals ?? 0}
          </span>
        </div>
      ),
    },

    // ── ACTIONS ───────────────────────────────────────────────────────────────
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="w-2">
          <AgentRowActions
            agent={row.original}
            toggleDialog={toggleDialog}
            setSelectedAgent={setSelectedAgent}
          />
        </div>
      ),
    },
  ];
}
