"use client";

import {
  AlertCircle,
  Check,
  ExternalLink,
  Star,
  X,
  ZoomIn,
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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import {
  type SubscriptionRequest,
  useConfirmSubscription,
  usePendingSubscriptions,
  useRejectSubscription,
} from "@/lib/queries/subscriptions";

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        onClick={onClose}
      >
        <X className="w-5 h-5 text-white" />
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-16 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
        onClick={(e) => e.stopPropagation()}
        title="Ouvrir dans un nouvel onglet"
      >
        <ExternalLink className="w-4 h-4 text-white" />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Capture de paiement"
        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ── Tier badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: SubscriptionRequest["tier"] }) {
  const map: Record<SubscriptionRequest["tier"], { label: string; className: string }> = {
    PRO:    { label: "Pro",    className: "bg-blue-100 text-blue-800" },
    AGENCY: { label: "Agency", className: "bg-purple-100 text-purple-800" },
  };
  const { label, className } = map[tier];
  return (
    <Badge className={`text-xs font-semibold inline-flex items-center gap-1 ${className}`}>
      <Star className="w-3 h-3" />
      {label}
    </Badge>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SubscriptionRequest["status"] }) {
  const t = useTranslation();
  const ts = t.subscriptions;
  const map: Record<SubscriptionRequest["status"], { label: string; className: string }> = {
    PENDING:   { label: ts.statusPending,   className: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: ts.statusConfirmed, className: "bg-green-100 text-green-800" },
    REJECTED:  { label: ts.statusRejected,  className: "bg-red-100 text-red-800" },
    EXPIRED:   { label: ts.statusExpired,   className: "bg-gray-100 text-gray-600" },
  };
  const { label, className } = map[status];
  return <Badge className={`text-xs font-semibold ${className}`}>{label}</Badge>;
}

// ── Reject dialog ─────────────────────────────────────────────────────────────

function RejectDialog({
  sub,
  open,
  onClose,
}: {
  sub: SubscriptionRequest | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslation();
  const ts = t.subscriptions;
  const [reason, setReason] = useState("");
  const reject = useRejectSubscription();

  const handleConfirm = async () => {
    if (!sub || !reason.trim()) return;
    try {
      await reject.mutateAsync({ subId: sub.id, reason: reason.trim() });
      toast.success(ts.toastRejected);
      setReason("");
      onClose();
    } catch {
      toast.error(ts.toastError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setReason(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ts.rejectDialogTitle}</DialogTitle>
          <DialogDescription>{ts.rejectDialogDesc}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={ts.rejectPlaceholder}
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => { setReason(""); onClose(); }}>
            {ts.rejectCancelBtn}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || reject.isPending}
          >
            {ts.rejectConfirmBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SubscriptionsQueue() {
  const t = useTranslation();
  const ts = t.subscriptions;
  const { data: subs = [], isLoading } = usePendingSubscriptions();
  const confirm = useConfirmSubscription();
  const [rejectTarget, setRejectTarget] = useState<SubscriptionRequest | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleConfirm = async (sub: SubscriptionRequest) => {
    try {
      await confirm.mutateAsync(sub.id);
      toast.success(ts.toastConfirmed);
    } catch {
      toast.error(ts.toastError);
    }
  };

  const paymentLabel = ts.paymentMethod as Record<string, string>;

  if (isLoading) return <Loading label={ts.loading} />;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header count */}
        {subs.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
              <AlertCircle className="w-3 h-3" />
              {subs.length}
            </span>
            {subs.length === 1 ? ts.countSingular : ts.countPlural}
          </p>
        )}

        {/* Empty state */}
        {subs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{ts.emptyTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{ts.emptyDesc}</p>
            </div>
          </div>
        )}

        {/* Subscription cards — FIFO order */}
        {subs.map((sub) => {
          const submittedAt = new Date(sub.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={sub.id}
              className="bg-card border rounded-xl p-5 flex flex-col gap-4 shadow-sm"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{sub.agent.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.agent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TierBadge tier={sub.tier} />
                  <StatusBadge status={sub.status} />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground">{ts.colAmount}: </span>
                  <span className="font-semibold text-primary">{sub.amount} {sub.currency}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{ts.colPayment}: </span>
                  <span className="font-medium">{paymentLabel[sub.paymentMethod] ?? sub.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{ts.colRef}: </span>
                  <span className="font-mono font-semibold text-primary">{sub.paymentReference ?? "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{ts.colDate}: </span>
                  <span className="font-medium">{submittedAt}</span>
                </div>
                {sub.agent.phoneNumber && (
                  <div>
                    <span className="text-muted-foreground">Tél: </span>
                    <span className="font-medium">{sub.agent.phoneNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">{ts.colScreenshot}: </span>
                  {sub.screenshotUrl ? (
                    <button
                      onClick={() => setLightboxUrl(sub.screenshotUrl!)}
                      className="inline-flex items-center gap-1 text-primary underline font-medium hover:text-primary/80 transition"
                    >
                      {ts.viewScreenshot}
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-muted-foreground italic">{ts.noScreenshot}</span>
                  )}
                </div>
              </div>

              {/* Action buttons (only for PENDING) */}
              {sub.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => handleConfirm(sub)}
                    disabled={confirm.isPending}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {ts.approveBtn}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5"
                    onClick={() => setRejectTarget(sub)}
                  >
                    <X className="w-3.5 h-3.5" />
                    {ts.rejectBtn}
                  </Button>
                </div>
              )}

              {/* Rejection reason */}
              {sub.status === "REJECTED" && sub.rejectionReason && (
                <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5">
                  <span className="font-semibold">Raison : </span>{sub.rejectionReason}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <RejectDialog
        sub={rejectTarget}
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
      />

      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
}
