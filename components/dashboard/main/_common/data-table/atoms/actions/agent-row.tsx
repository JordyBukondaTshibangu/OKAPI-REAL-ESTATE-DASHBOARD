"use client";

import {
  Ban,
  CalendarClock,
  Check,
  ExternalLink,
  Eye,
  MessageCircle,
  MoreVertical,
  PlayCircle,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useApproveAgent,
  useRejectAgent,
  useSuspendAgent,
  useUnsuspendAgent,
} from "@/lib/queries/agents";
import { Agent } from "@/types";
import { AgentDialogType } from "@/components/dashboard/main/_common/data-table/molecules/columns/agent-column";

type AgentRowActionsProps = {
  agent: Agent;
  toggleDialog: (key: AgentDialogType, value: boolean) => void;
  setSelectedAgent: (agent: Agent) => void;
};

export function AgentRowActions({ agent, toggleDialog, setSelectedAgent }: AgentRowActionsProps) {
  const router         = useRouter();
  const approveAgent   = useApproveAgent();
  const rejectAgent    = useRejectAgent();
  const suspendAgent   = useSuspendAgent();
  const unsuspendAgent = useUnsuspendAgent();

  const [loading, setLoading] = useState<string | null>(null);

  const isPendingApproval =
    agent.verificationTier === "NON_VERIFIE" && agent.emailVerified === true;
  const isSuspended = agent.isSuspended === true;

  const run = useCallback(
    async (key: string, fn: () => Promise<unknown>) => {
      if (loading) return;
      setLoading(key);
      try { await fn(); } finally { setLoading(null); }
    },
    [loading],
  );

  const whatsappPhone = (agent.phoneNumber ?? "").replace(/\D/g, "");
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        `Bonjour ${agent.name}, nous vous contactons depuis Okapi Real Estate.`,
      )}`
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg hover:bg-muted"
          aria-label="Actions"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-0 rounded-xl shadow-xl border border-border/60 overflow-hidden"
        align="end"
        sideOffset={6}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-[#0B1D3A] border-b border-white/10">
          <p className="text-[13px] font-semibold text-white truncate leading-tight">{agent.name}</p>
          {agent.email && (
            <p className="text-[11px] text-white/50 truncate mt-0.5">{agent.email}</p>
          )}
        </div>

        <div className="p-1.5 space-y-0.5">

          {/* ── Approval banner ───────────────────────────────────── */}
          {isPendingApproval && (
            <div className="px-3 py-2.5 mb-1 rounded-lg bg-amber-50 border border-amber-200/80">
              <p className="text-[11px] font-semibold text-amber-800 mb-2 uppercase tracking-wide">
                En attente d&apos;approbation
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => run("approve", () => approveAgent.mutateAsync(agent.id))}
                  disabled={!!loading}
                  className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="size-3.5 shrink-0" />
                  {loading === "approve" ? "Approbation…" : "Approuver"}
                </button>
                <button
                  onClick={() => run("reject", () => rejectAgent.mutateAsync(agent.id))}
                  disabled={!!loading}
                  className="flex-1 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="size-3.5 shrink-0" />
                  {loading === "reject" ? "Rejet…" : "Rejeter"}
                </button>
              </div>
            </div>
          )}

          {/* ── View profile ──────────────────────────────────────── */}
          <DropdownMenuItem
            onClick={() => router.push(`/agents/${agent.id}`)}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer group"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors shrink-0">
              <Eye className="size-3.5 text-blue-600" />
            </span>
            <span className="text-[13px] font-medium flex-1">Voir le profil</span>
            <ExternalLink className="size-3 text-muted-foreground/60" />
          </DropdownMenuItem>

          {/* ── WhatsApp ─────────────────────────────────────────── */}
          {whatsappUrl ? (
            <DropdownMenuItem asChild className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer group">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors shrink-0">
                  <MessageCircle className="size-3.5 text-emerald-600" />
                </span>
                <span className="text-[13px] font-medium text-emerald-700 flex-1">Contacter sur WhatsApp</span>
                <ExternalLink className="size-3 text-muted-foreground/60" />
              </a>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg opacity-40">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted shrink-0">
                <MessageCircle className="size-3.5 text-muted-foreground" />
              </span>
              <span className="text-[13px] font-medium">WhatsApp (no. manquant)</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="my-1" />

          {/* ── Suspend / Unsuspend ───────────────────────────────── */}
          {isSuspended ? (
            <DropdownMenuItem
              onClick={() => run("unsuspend", () => unsuspendAgent.mutateAsync(agent.id))}
              disabled={loading === "unsuspend"}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer group"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors shrink-0">
                <PlayCircle className="size-3.5 text-emerald-600" />
              </span>
              <span className="text-[13px] font-medium">
                {loading === "unsuspend" ? "Réactivation…" : "Réactiver le compte"}
              </span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => run("suspend", () => suspendAgent.mutateAsync({ id: agent.id }))}
              disabled={loading === "suspend"}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer group"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors shrink-0">
                <Ban className="size-3.5 text-amber-600" />
              </span>
              <span className="text-[13px] font-medium text-amber-700">
                {loading === "suspend" ? "Suspension…" : "Suspendre le compte"}
              </span>
            </DropdownMenuItem>
          )}

          {/* ── Extend free period ────────────────────────────────── */}
          <DropdownMenuItem
            onClick={() => { setSelectedAgent(agent); toggleDialog("editAgent", true); }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer group"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors shrink-0">
              <CalendarClock className="size-3.5 text-purple-600" />
            </span>
            <span className="text-[13px] font-medium">Étendre la période gratuite</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          {/* ── Delete ───────────────────────────────────────────── */}
          <DropdownMenuItem
            onClick={() => { setSelectedAgent(agent); toggleDialog("deleteAgent", true); }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer group"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors shrink-0">
              <Trash2 className="size-3.5 text-red-500" />
            </span>
            <span className="text-[13px] font-medium text-red-600">Supprimer l&apos;agent</span>
          </DropdownMenuItem>

        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
