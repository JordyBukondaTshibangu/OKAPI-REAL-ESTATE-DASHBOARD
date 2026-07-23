"use client";

import {
  AlertCircle, Briefcase, Building2, Check, ExternalLink,
  Home, ShoppingBag, TreePine, Warehouse, X, ZoomIn,
  type LucideIcon,
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
  type BoostRequest,
  useConfirmBoost,
  usePendingBoosts,
  useRejectBoost,
} from "@/lib/queries/boosts";

// ── Property thumbnail with category fallback ─────────────────────────────────

const CATEGORY_ICON: Record<string, { Icon: LucideIcon; bg: string; color: string }> = {
  apartment:   { Icon: Building2,   bg: "bg-blue-50",    color: "text-blue-400" },
  studio:      { Icon: Building2,   bg: "bg-blue-50",    color: "text-blue-400" },
  duplex:      { Icon: Building2,   bg: "bg-blue-50",    color: "text-blue-400" },
  penthouse:   { Icon: Building2,   bg: "bg-indigo-50",  color: "text-indigo-400" },
  villa:       { Icon: Home,        bg: "bg-emerald-50", color: "text-emerald-400" },
  house:       { Icon: Home,        bg: "bg-emerald-50", color: "text-emerald-400" },
  townhouse:   { Icon: Home,        bg: "bg-teal-50",    color: "text-teal-400" },
  land:        { Icon: TreePine,    bg: "bg-lime-50",    color: "text-lime-500" },
  terrain:     { Icon: TreePine,    bg: "bg-lime-50",    color: "text-lime-500" },
  office:      { Icon: Briefcase,   bg: "bg-amber-50",   color: "text-amber-400" },
  warehouse:   { Icon: Warehouse,   bg: "bg-orange-50",  color: "text-orange-400" },
  entrepot:    { Icon: Warehouse,   bg: "bg-orange-50",  color: "text-orange-400" },
  retail:      { Icon: ShoppingBag, bg: "bg-rose-50",    color: "text-rose-400" },
  store:       { Icon: ShoppingBag, bg: "bg-rose-50",    color: "text-rose-400" },
  commercial:  { Icon: ShoppingBag, bg: "bg-pink-50",    color: "text-pink-400" },
};

function CategoryPlaceholder({ category }: { category?: string }) {
  const cfg = CATEGORY_ICON[category?.toLowerCase() ?? ""] ?? { Icon: Home, bg: "bg-slate-100", color: "text-slate-400" };
  return (
    <div className={`w-full sm:w-28 h-28 rounded-lg shrink-0 flex items-center justify-center ${cfg.bg}`}>
      <cfg.Icon className={`w-10 h-10 ${cfg.color}`} />
    </div>
  );
}

function PropertyThumb({ src, category, title }: { src?: string; category?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <CategoryPlaceholder category={category} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      className="w-full sm:w-28 h-28 object-cover rounded-lg shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

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

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BoostRequest["status"] }) {
  const t = useTranslation();
  const tb = t.boosts;
  const map: Record<BoostRequest["status"], { label: string; className: string }> = {
    PENDING:   { label: tb.statusPending,   className: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: tb.statusConfirmed, className: "bg-green-100 text-green-800" },
    REJECTED:  { label: tb.statusRejected,  className: "bg-red-100 text-red-800" },
    EXPIRED:   { label: tb.statusExpired,   className: "bg-gray-100 text-gray-600" },
  };
  const { label, className } = map[status];
  return <Badge className={`text-xs font-semibold ${className}`}>{label}</Badge>;
}

// ── Reject dialog ─────────────────────────────────────────────────────────────

function RejectDialog({
  boost,
  open,
  onClose,
}: {
  boost: BoostRequest | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslation();
  const tb = t.boosts;
  const [reason, setReason] = useState("");
  const reject = useRejectBoost();

  const handleConfirm = async () => {
    if (!boost || !reason.trim()) return;
    try {
      await reject.mutateAsync({ boostId: boost.id, reason: reason.trim() });
      toast.success(tb.toastRejected);
      setReason("");
      onClose();
    } catch {
      toast.error(tb.toastError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setReason(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tb.rejectDialogTitle}</DialogTitle>
          <DialogDescription>{tb.rejectDialogDesc}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={tb.rejectPlaceholder}
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => { setReason(""); onClose(); }}>
            {tb.rejectCancelBtn}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || reject.isPending}
          >
            {tb.rejectConfirmBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BoostsQueue() {
  const t = useTranslation();
  const tb = t.boosts;
  const { data: boosts = [], isLoading } = usePendingBoosts();
  const confirm = useConfirmBoost();
  const [rejectTarget, setRejectTarget] = useState<BoostRequest | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleConfirm = async (boost: BoostRequest) => {
    try {
      await confirm.mutateAsync(boost.id);
      toast.success(tb.toastConfirmed);
    } catch {
      toast.error(tb.toastError);
    }
  };

  const paymentLabel: Record<string, string> = tb.paymentMethod as Record<string, string>;

  if (isLoading) return <Loading label={tb.loading} />;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header count */}
        {boosts.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
              <AlertCircle className="w-3 h-3" />
              {boosts.length}
            </span>
            {boosts.length === 1 ? tb.countSingular : tb.countPlural}
          </p>
        )}

        {/* Empty state */}
        {boosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{tb.emptyTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{tb.emptyDesc}</p>
            </div>
          </div>
        )}

        {/* Boost cards — vertical list, FIFO order */}
        {boosts.map((boost) => {
          const coverImg = boost.property.gallery?.[0];
          const location = [boost.property.suburb, boost.property.city]
            .filter(Boolean)
            .join(", ");
          const submittedAt = new Date(boost.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={boost.id}
              className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row gap-5 shadow-sm"
            >
              {/* Property thumbnail */}
              <PropertyThumb
                src={coverImg}
                category={boost.property.category}
                title={boost.property.title}
              />

              {/* Main info */}
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">{boost.property.title}</p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                  <StatusBadge status={boost.status} />
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">{tb.colAgent}: </span>
                    <span className="font-medium">{boost.agent.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{tb.colPlan}: </span>
                    <span className="font-medium">{boost.durationDays}j — {boost.amount} $</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{tb.colPayment}: </span>
                    <span className="font-medium">{paymentLabel[boost.paymentMethod] ?? boost.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{tb.colRef}: </span>
                    <span className="font-mono font-semibold text-primary">{boost.paymentReference ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{tb.colDate}: </span>
                    <span className="font-medium">{submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{tb.colScreenshot}: </span>
                    {boost.screenshotUrl ? (
                      <button
                        onClick={() => setLightboxUrl(boost.screenshotUrl!)}
                        className="inline-flex items-center gap-1 text-primary underline font-medium hover:text-primary/80 transition"
                      >
                        {tb.viewScreenshot}
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-muted-foreground italic">{tb.noScreenshot}</span>
                    )}
                  </div>
                </div>

                {/* Action buttons (only for PENDING) */}
                {boost.status === "PENDING" && (
                  <div className="flex gap-2 mt-1">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      onClick={() => handleConfirm(boost)}
                      disabled={confirm.isPending}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {tb.approveBtn}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => setRejectTarget(boost)}
                    >
                      <X className="w-3.5 h-3.5" />
                      {tb.rejectBtn}
                    </Button>
                  </div>
                )}

                {/* Rejection reason */}
                {boost.status === "REJECTED" && boost.rejectionReason && (
                  <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5 mt-1">
                    <span className="font-semibold">Raison : </span>{boost.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RejectDialog
        boost={rejectTarget}
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
      />

      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
}
