"use client";

import { Suspense } from "react";
import ReviewsQueue from "@/components/dashboard/main/reviews";
import { Loading } from "@/components/common/loading";
import { useTranslation } from "@/hooks/use-translation";

export default function ReviewsPage() {
  const t = useTranslation();
  const tr = t.reviews;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tr.pageTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{tr.pageSubtitle}</p>
      </div>
      <Suspense fallback={<Loading label={tr.loading} />}>
        <ReviewsQueue />
      </Suspense>
    </div>
  );
}
