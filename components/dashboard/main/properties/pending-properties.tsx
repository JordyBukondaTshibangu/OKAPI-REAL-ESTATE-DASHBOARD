"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  CheckCircle,
  Loader2,
  MapPin,
  User,
  XCircle,
  Home,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveProperty,
  usePendingProperties,
  useRejectProperty,
} from "@/lib/queries/properties";
import { Loading } from "@/components/common/loading";
import { useTranslation } from "@/hooks/use-translation";

function resolveAgentName(agent: unknown): string {
  if (!agent || typeof agent !== "object") return "–";
  return String((agent as Record<string, unknown>).name ?? "–");
}

export default function PendingProperties() {
  const { data: pending = [], isLoading } = usePendingProperties();
  const approve = useApproveProperty();
  const reject = useRejectProperty();
  const t = useTranslation().properties;

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) return <Loading label={t.pendingLoading} />;

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <p className="text-lg font-semibold text-foreground">{t.pendingEmpty}</p>
        <p className="text-sm text-muted-foreground">{t.pendingEmptyDesc}</p>
      </div>
    );
  }

  const countLabel = pending.length > 1 ? t.pendingCountPlural : t.pendingCountSingular;

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-6 bg-brand-navy rounded-full" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t.pendingTitle}</h1>
          <p className="text-xs text-muted-foreground">
            {pending.length} {countLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {pending.map((p) => {
          const isApproving = approve.isPending && approve.variables === p.id;
          const isRejecting =
            reject.isPending && (reject.variables as { id: string })?.id === p.id;
          const busy = isApproving || isRejecting;

          const agentName = resolveAgentName((p as any).agent);
          const agencyName =
            (p as any).agency?.name ??
            (p as any).agent?.agency?.name ??
            null;

          return (
            <Card key={p.id} className="border border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: listing info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {t.badgePending}
                      </Badge>
                      {(p as any).listingType === "sale" ? (
                        <Badge variant="outline" className="bg-brand-navy/10 text-brand-navy text-xs">
                          {t.badgeSale}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          {t.badgeRent}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        #{p.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <h2 className="font-semibold text-foreground text-sm mb-1 truncate">
                      {(p as any).title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[(p as any).suburb, (p as any).city].filter(Boolean).join(", ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {(p as any).category}
                      </span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat("fr-FR").format((p as any).price ?? 0)}{" "}
                        {(p as any).currency ?? "USD"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {agentName}
                      </span>
                      {agencyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {agencyName}
                        </span>
                      )}
                    </div>

                    {(p as any).description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {(p as any).description}
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                      onClick={() => approve.mutate(p.id)}
                      disabled={busy}
                    >
                      {isApproving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <BadgeCheck className="w-3.5 h-3.5" />
                      )}
                      {t.approveBtn}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                      onClick={() => {
                        setRejectTarget(p.id);
                        setRejectReason("");
                      }}
                      disabled={busy}
                    >
                      {isRejecting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {t.rejectBtn}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rejectDialogTitle}</DialogTitle>
            <DialogDescription>{t.rejectDialogDesc}</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t.rejectPlaceholder}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              {t.rejectCancelBtn}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim() || reject.isPending}
              onClick={() => {
                if (!rejectTarget) return;
                reject.mutate(
                  { id: rejectTarget, reason: rejectReason.trim() },
                  { onSuccess: () => setRejectTarget(null) },
                );
              }}
            >
              {reject.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {t.rejectConfirmBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
