"use client";

import { Check, Loader2, Star, User, Building2, Clock, X } from "lucide-react";
import { toast } from "sonner";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import {
  type PendingReview,
  usePendingReviews,
  useModerateReview,
} from "@/lib/queries/reviews";

// ── Star row ──────────────────────────────────────────────────────────────────

function StarRow({ label, value }: { label: string; value?: number | null }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="w-36 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${
              s <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span>({value}/5)</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: PendingReview }) {
  const t = useTranslation();
  const tr = t.reviews;
  const moderate = useModerateReview();

  async function handleAction(action: "approve" | "reject") {
    try {
      await moderate.mutateAsync({ reviewId: review.id, action });
      toast.success(action === "approve" ? tr.toastApproved : tr.toastRejected);
    } catch {
      toast.error(tr.toastError);
    }
  }

  const isPending = moderate.isPending;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          {/* Author */}
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            {review.user
              ? `${review.user.firstName} ${review.user.lastName}`
              : tr.unknownUser}
          </div>

          {/* Target */}
          {review.agent && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="w-4 h-4 shrink-0" />
              <span>{tr.agentPrefix}</span>
              <a
                href={`/agents/${review.agent.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline truncate"
              >
                {review.agent.name}
              </a>
            </div>
          )}
          {review.property && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{tr.propertyPrefix}</span>
              <a
                href={`/properties/${review.property.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline truncate"
              >
                {review.property.title}
              </a>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {formatDate(review.createdAt)}
          </div>
        </div>

        {/* Overall rating */}
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${
                s <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
          <Badge variant="secondary" className="ml-1 text-xs">
            {review.rating}/5
          </Badge>
        </div>
      </div>

      {/* Sub-ratings */}
      {(review.ratingReactivite != null ||
        review.ratingHonnetete != null ||
        review.ratingProfessionnalisme != null) && (
        <div className="space-y-1 pl-1">
          <StarRow label={tr.subRatingReactivite} value={review.ratingReactivite} />
          <StarRow label={tr.subRatingHonnetete} value={review.ratingHonnetete} />
          <StarRow label={tr.subRatingProfessionnalisme} value={review.ratingProfessionnalisme} />
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <blockquote className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed italic border-l-2 border-muted-foreground/20">
          &ldquo;{review.comment}&rdquo;
        </blockquote>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={isPending}
          onClick={() => handleAction("approve")}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              {tr.approveBtn}
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
          disabled={isPending}
          onClick={() => handleAction("reject")}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <X className="w-4 h-4 mr-1.5" />
              {tr.rejectBtn}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ReviewsQueue() {
  const t = useTranslation();
  const tr = t.reviews;
  const { data: reviews, isLoading } = usePendingReviews();

  if (isLoading) return <Loading label={tr.loading} />;

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <Check className="w-12 h-12 text-emerald-500" />
        <p className="text-lg font-semibold">{tr.emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{tr.emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
