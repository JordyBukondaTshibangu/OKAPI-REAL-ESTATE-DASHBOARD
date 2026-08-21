"use client";

import { Suspense } from "react";
import ReportsQueue from "@/components/dashboard/main/reports";
import { Loading } from "@/components/common/loading";
import { useTranslation } from "@/hooks/use-translation";

export default function ReportsPage() {
  const t = useTranslation();
  const tr = t.reports;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tr.pageTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{tr.pageSubtitle}</p>
      </div>
      <Suspense fallback={<Loading label={tr.loading} />}>
        <ReportsQueue />
      </Suspense>
    </div>
  );
}
