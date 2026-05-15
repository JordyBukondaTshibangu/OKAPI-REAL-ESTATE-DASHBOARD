"use client";

import { useCallback, useState } from "react";
import { CalendarDays, Search, X } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/dashboard/main/_common/table-pagination";
import { useAuditLogs } from "@/lib/queries/audit-logs";
import { useAuditLogStore } from "@/lib/stores/audit-logs";
import { PAGE_SIZE } from "@/constants";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  LOGIN: "bg-purple-100 text-purple-700 border-purple-200",
  LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
};

function actionColor(action: string) {
  return ACTION_COLORS[action.toUpperCase()] ?? "bg-muted text-muted-foreground border-border";
}

export default function AuditLogsView() {
  const { params, currentPage, setParams, setCurrentPage } = useAuditLogStore();

  const [searchDraft, setSearchDraft] = useState(params.search ?? "");
  const [dateFrom, setDateFrom] = useState(params.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(params.dateTo ?? "");

  const { data, isLoading, isFetching } = useAuditLogs({
    ...params,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const applyFilters = useCallback(() => {
    setParams({
      search: searchDraft.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }, [searchDraft, dateFrom, dateTo, setParams]);

  function clearFilters() {
    setSearchDraft("");
    setDateFrom("");
    setDateTo("");
    setParams({ search: undefined, dateFrom: undefined, dateTo: undefined });
  }

  const hasFilters = Boolean(params.search || params.dateFrom || params.dateTo);
  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track all admin actions across the platform.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border bg-card">
        {/* Search */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-48">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Action, resource, details…"
              className="pl-9"
            />
          </div>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            From
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            To
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={applyFilters} className="bg-gradient-primary">
            Apply
          </Button>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          {params.search && (
            <Badge variant="outline" className="text-xs gap-1">
              Search: {params.search}
            </Badge>
          )}
          {params.dateFrom && (
            <Badge variant="outline" className="text-xs gap-1">
              From: {params.dateFrom}
            </Badge>
          )}
          {params.dateTo && (
            <Badge variant="outline" className="text-xs gap-1">
              To: {params.dateTo}
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-44">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-28">
                  Action
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-36">
                  Resource
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Details
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-48">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No audit logs found
                    {hasFilters ? " for the selected filters" : ""}.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${actionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {log.resource}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground truncate">
                      {log.admin?.email ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={total}
          onPageChange={setCurrentPage}
          entityLabel="logs"
        />
      </div>
    </div>
  );
}
