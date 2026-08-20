"use client";

import {
  Check,
  ChevronDown,
  MessageCircle,
  Star,
  TrendingDown,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";
import {
  type ActiveSubAgent,
  type SubscriptionRequest,
  useActiveAgentSubscriptions,
  useDowngradeAgent,
  useExtendAgent,
  usePendingSubscriptions,
  useConfirmSubscription,
  useRejectSubscription,
} from "@/lib/queries/subscriptions";

// ── Status helpers ────────────────────────────────────────────────────────────

function getAgentStatus(agent: ActiveSubAgent): "active" | "expiring" | "expired" {
  if (!agent.subscriptionEndsAt) return "expired";
  const end = new Date(agent.subscriptionEndsAt);
  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60_000);
  if (end <= now) return "expired";
  if (end <= in7days) return "expiring";
  return "active";
}

function StatusBadge({ agent }: { agent: ActiveSubAgent }) {
  const t = useTranslation().subscriptions;
  const status = getAgentStatus(agent);
  const map = {
    active:   { label: t.statusActive,   className: "bg-emerald-100 text-emerald-700" },
    expiring: { label: t.statusExpiring, className: "bg-amber-100 text-amber-700" },
    expired:  { label: t.statusExpired,  className: "bg-red-100 text-red-600" },
  };
  const { label, className } = map[status];
  return <Badge className={`text-xs font-semibold ${className}`}>{label}</Badge>;
}

function PlanBadge({ plan }: { plan: "PRO" | "AGENCY" }) {
  const isPro = plan === "PRO";
  return (
    <Badge className={`text-xs font-semibold inline-flex items-center gap-1 ${
      isPro ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
    }`}>
      <Star className="w-3 h-3" />
      {plan === "PRO" ? "Pro" : "Agency"}
    </Badge>
  );
}

// ── Downgrade confirmation dialog ─────────────────────────────────────────────

function DowngradeDialog({
  agent,
  open,
  onClose,
}: {
  agent: ActiveSubAgent | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslation().subscriptions;
  const downgrade = useDowngradeAgent();

  const handleConfirm = async () => {
    if (!agent) return;
    try {
      await downgrade.mutateAsync(agent.id);
      toast.success(t.toastDowngraded);
      onClose();
    } catch {
      toast.error(t.toastError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.confirmDowngradeTitle}</DialogTitle>
          <DialogDescription>
            {agent && <span className="font-semibold">{agent.name}</span>}
            {" — "}
            {t.confirmDowngradeDesc}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.rejectCancelBtn}</Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={downgrade.isPending}
          >
            {t.confirmDowngradeBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Pending request row ───────────────────────────────────────────────────────

const PM_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MONEY:    "MTN Money",
  AIRTEL_MONEY: "Airtel Money",
  MPESA:        "M-Pesa",
  CASH:         "Cash",
};

function PendingRequestRow({ req }: { req: SubscriptionRequest }) {
  const confirm = useConfirmSubscription();
  const reject  = useRejectSubscription();

  const handleConfirm = async () => {
    try {
      await confirm.mutateAsync(req.id);
      toast.success("Abonnement confirmé !");
    } catch {
      toast.error("Erreur lors de la confirmation.");
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Raison du refus (optionnel) :") ?? "";
    try {
      await reject.mutateAsync({ subId: req.id, reason });
      toast.success("Demande refusée.");
    } catch {
      toast.error("Erreur lors du refus.");
    }
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <p className="font-semibold text-sm text-foreground">{req.agent.name}</p>
        <p className="text-xs text-muted-foreground">{req.agent.email}</p>
      </td>
      <td className="px-4 py-3">
        <Badge className={`text-xs font-semibold inline-flex items-center gap-1 ${req.tier === "PRO" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
          <Star className="w-3 h-3" />
          {req.tier === "PRO" ? "Pro" : "Agency"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge className="text-xs font-semibold bg-amber-100 text-amber-700">En attente</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{PM_LABELS[req.paymentMethod] ?? req.paymentMethod}</td>
      <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">${req.amount}</td>
      <td className="px-4 py-3 font-mono text-xs text-blue-700">{req.paymentReference}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            disabled={confirm.isPending}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50"
          >
            <Check className="w-3 h-3 inline mr-1" />Confirmer
          </button>
          <button
            onClick={handleReject}
            disabled={reject.isPending}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50"
          >
            <X className="w-3 h-3 inline mr-1" />Refuser
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Agent row ─────────────────────────────────────────────────────────────────

function AgentRow({
  agent,
  onDowngrade,
}: {
  agent: ActiveSubAgent;
  onDowngrade: (agent: ActiveSubAgent) => void;
}) {
  const t = useTranslation().subscriptions;
  const extend = useExtendAgent();
  const latestSub = agent.subscriptionRequests[0];

  const endsAt = agent.subscriptionEndsAt
    ? new Date(agent.subscriptionEndsAt).toLocaleDateString("fr-FR", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  const handleExtend = async () => {
    try {
      await extend.mutateAsync({ agentId: agent.id, days: 30 });
      toast.success(t.toastExtended);
    } catch {
      toast.error(t.toastError);
    }
  };

  const whatsappHref = agent.whatsappNumber
    ? `https://wa.me/${agent.whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {/* Agent */}
      <td className="px-4 py-3">
        <div>
          <p className="font-semibold text-sm text-foreground">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.email}</p>
          {agent.agency && (
            <p className="text-xs text-muted-foreground mt-0.5 italic">{agent.agency.name}</p>
          )}
        </div>
      </td>

      {/* Plan */}
      <td className="px-4 py-3">
        <PlanBadge plan={agent.plan} />
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

      {/* Actions */}
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
              ⋮ <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExtend} disabled={extend.isPending}>
              <Check className="w-3.5 h-3.5 mr-2 text-emerald-600" />
              {t.actionExtend}
            </DropdownMenuItem>
            {whatsappHref && (
              <DropdownMenuItem asChild>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-3.5 h-3.5 mr-2 text-green-600" />
                  {t.actionWhatsApp}
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDowngrade(agent)}
            >
              <TrendingDown className="w-3.5 h-3.5 mr-2" />
              {t.actionDowngrade}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type FilterStatus = "all" | "active" | "expiring" | "expired";

export default function AgentsProPage() {
  const t = useTranslation().subscriptions;
  const [filter, setFilter] = useState<FilterStatus>("all");
  const { data: agents = [], isLoading } = useActiveAgentSubscriptions(
    filter !== "all" ? filter : undefined,
  );
  const { data: pendingRequests = [] } = usePendingSubscriptions();
  const [downgradeTarget, setDowngradeTarget] = useState<ActiveSubAgent | null>(null);

  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: "all",      label: t.filterAll },
    { key: "active",   label: t.filterActive },
    { key: "expiring", label: t.filterExpiring },
    { key: "expired",  label: t.filterExpired },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.agentsTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.agentsSubtitle}</p>
      </div>

      {/* Pending subscription requests */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold">Demandes en attente</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              {pendingRequests.length}
            </span>
          </div>
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 border-b border-amber-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Agent</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Plan</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Statut</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Paiement</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Montant</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Référence</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <PendingRequestRow key={req.id} req={req} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === key
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <Loading label={t.agentsLoading} />
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <X className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{t.agentsEmpty}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.agentsEmptyDesc}</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colName}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colPlan}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colEnds}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colAmount}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    onDowngrade={setDowngradeTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground px-4 py-2 border-t border-border">
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <DowngradeDialog
        agent={downgradeTarget}
        open={Boolean(downgradeTarget)}
        onClose={() => setDowngradeTarget(null)}
      />
    </div>
  );
}
