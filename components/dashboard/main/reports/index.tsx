"use client";

import {
  AlertTriangle, Check, EyeOff, Flag, MessageSquareWarning, Trash2,
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
import { useTranslation } from "@/hooks/use-translation";
import {
  type GroupedReport,
  type ResolveAction,
  useGroupedReports,
  useResolveReport,
} from "@/lib/queries/reports";

// ── Confirm dialog ────────────────────────────────────────────────────────────

type ConfirmState = {
  group: GroupedReport;
  action: ResolveAction;
} | null;

function ConfirmDialog({
  state,
  onClose,
  adminId,
}: {
  state: ConfirmState;
  onClose: () => void;
  adminId: string;
}) {
  const t = useTranslation();
  const tr = t.reports;
  const resolve = useResolveReport();

  const ACTION_META: Record<
    ResolveAction,
    { title: string; desc: string; btnLabel: string; btnClass: string }
  > = {
    dismiss: {
      title: tr.dismissTitle,
      desc: tr.dismissDesc,
      btnLabel: tr.dismissBtn,
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    warn_agent: {
      title: tr.warnTitle,
      desc: tr.warnDesc,
      btnLabel: tr.warnBtn,
      btnClass: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    delete_listing: {
      title: tr.deleteTitle,
      desc: tr.deleteDesc,
      btnLabel: tr.deleteBtn,
      btnClass: "bg-destructive hover:bg-destructive/90 text-white",
    },
  };

  const meta = state ? ACTION_META[state.action] : null;

  const handleConfirm = async () => {
    if (!state || !meta) return;
    const reportId = state.group.reportIds[0];
    try {
      await resolve.mutateAsync({ reportId, action: state.action, adminId });
      toast.success(tr.toastSuccess);
      onClose();
    } catch {
      toast.error(tr.toastError);
    }
  };

  return (
    <Dialog open={Boolean(state)} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{meta?.title}</DialogTitle>
          <DialogDescription>{meta?.desc}</DialogDescription>
        </DialogHeader>
        {state && (
          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            <p className="font-semibold text-foreground line-clamp-1">{state.group.property.title}</p>
            <p className="text-muted-foreground">
              {state.group.count} {state.group.count > 1 ? tr.pendingCountPlural : tr.pendingCount}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={resolve.isPending}>
            {tr.confirmCancel}
          </Button>
          <Button
            className={meta?.btnClass}
            onClick={handleConfirm}
            disabled={resolve.isPending}
          >
            {meta?.btnLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReportsQueue() {
  const t = useTranslation();
  const tr = t.reports;
  const { data: groups = [], isLoading } = useGroupedReports();
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const REASON_LABELS: Record<string, string> = {
    FAKE_LISTING:   tr.reasonFakeListing,
    WRONG_PRICE:    tr.reasonWrongPrice,
    STOLEN_PHOTOS:  tr.reasonStolenPhotos,
    ALREADY_RENTED: tr.reasonAlreadyRented,
    SCAM:           tr.reasonScam,
    INAPPROPRIATE:  tr.reasonInappropriate,
    OTHER:          tr.reasonOther,
  };

  if (isLoading) return <Loading label={tr.loading} />;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Count */}
        {groups.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
              <AlertTriangle className="w-3 h-3" />
              {groups.length}
            </span>
            {groups.length === 1 ? tr.countSingular : tr.countPlural}
          </p>
        )}

        {/* Empty */}
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{tr.emptyTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{tr.emptyDesc}</p>
            </div>
          </div>
        )}

        {/* Group cards */}
        {groups.map((group) => {
          const location = [group.property.suburb].filter(Boolean).join(", ");
          return (
            <div key={group.property.id} className="bg-card border rounded-xl p-5 flex flex-col gap-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Flag className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">{group.property.title}</p>
                    {location && <p className="text-xs text-muted-foreground">{location}</p>}
                    {group.property.agent && (
                      <p className="text-xs text-muted-foreground">{tr.agentPrefix} {group.property.agent.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {group.isAutoHidden && (
                    <Badge className="bg-red-100 text-red-800 gap-1 text-xs">
                      <EyeOff className="w-3 h-3" /> {tr.autoHiddenBadge}
                    </Badge>
                  )}
                  <Badge className="bg-amber-100 text-amber-800 font-bold text-xs">
                    {group.count} {group.count > 1 ? tr.pendingCountPlural : tr.pendingCount}
                  </Badge>
                </div>
              </div>

              {/* Reason breakdown */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(group.reasons).map(([reason, count]) => (
                  <span
                    key={reason}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-foreground/70"
                  >
                    <span className="font-semibold text-foreground">{count}×</span>
                    {REASON_LABELS[reason] ?? reason}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => setConfirmState({ group, action: "dismiss" })}
                >
                  <Check className="w-3.5 h-3.5" />
                  {tr.actionDismiss}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => setConfirmState({ group, action: "warn_agent" })}
                >
                  <MessageSquareWarning className="w-3.5 h-3.5" />
                  {tr.actionWarnAgent}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  onClick={() => setConfirmState({ group, action: "delete_listing" })}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {tr.actionDeleteListing}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        state={confirmState}
        onClose={() => setConfirmState(null)}
        adminId="admin"
      />
    </>
  );
}
