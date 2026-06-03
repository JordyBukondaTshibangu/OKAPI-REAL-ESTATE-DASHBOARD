"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditLogs } from "@/lib/queries/audit-logs";
import { useTranslation } from "@/hooks/use-translation";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN:  "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-600",
};

function actionColor(action: string) {
  return ACTION_COLORS[action.toUpperCase()] ?? "bg-muted text-muted-foreground";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function RecentAuditLogs() {
  const t = useTranslation();
  const { data, isLoading } = useAuditLogs({ page: 1, limit: 5 });
  const logs = data?.data ?? [];

  return (
    <Card className="card-luxury rounded-xl h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-4 bg-brand-gold rounded-full" />
          {t.dashboard.recentActivity}
        </CardTitle>
        <Link
          href="/audit-logs"
          className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
        >
          {t.dashboard.viewAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col gap-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
              <div className="h-5 w-14 rounded bg-muted animate-pulse shrink-0" />
              <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t.dashboard.noActivity}
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-3 border-b last:border-0"
            >
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${actionColor(log.action)}`}
              >
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {log.resource}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {log.details}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                {formatTime(log.createdAt)}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
