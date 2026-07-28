"use client";

import { Rocket, Star, X } from "lucide-react";
import React, { useState } from "react";

import { Loading } from "@/components/common/loading";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import {
  type PaymentHistoryEntry,
  useCombinedPaymentHistory,
} from "@/lib/queries/subscriptions";

// ── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ entry }: { entry: PaymentHistoryEntry }) {
  const t = useTranslation().subscriptions;
  if (entry.type === "SUBSCRIPTION") {
    return (
      <Badge className="text-xs font-semibold bg-blue-100 text-blue-700 inline-flex items-center gap-1">
        <Star className="w-3 h-3" />
        {t.typeSubscription} {entry.tier ? `(${entry.tier})` : ""}
      </Badge>
    );
  }
  return (
    <Badge className="text-xs font-semibold bg-amber-100 text-amber-700 inline-flex items-center gap-1">
      <Rocket className="w-3 h-3" />
      {t.typeBoost}
    </Badge>
  );
}

// ── Payment method display ────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MONEY: "MTN Money",
  AIRTEL_MONEY: "Airtel Money",
  MPESA: "M-Pesa",
  CASH: "Cash",
};

// ── Month totals row ──────────────────────────────────────────────────────────

function MonthSeparator({ month, total }: { month: string; total: number }) {
  const [year, m] = month.split("-");
  const label = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "long", year: "numeric",
  });
  return (
    <tr className="bg-muted/40">
      <td colSpan={7} className="px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className="text-xs font-bold text-primary">${total.toFixed(2)}</span>
        </div>
      </td>
    </tr>
  );
}

// ── Payment row ───────────────────────────────────────────────────────────────

function PaymentRow({ entry }: { entry: PaymentHistoryEntry }) {
  const confirmedAt = entry.confirmedAt
    ? new Date(entry.confirmedAt).toLocaleDateString("fr-FR", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <TypeBadge entry={entry} />
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{entry.agent.name}</p>
          <p className="text-xs text-muted-foreground">{entry.agent.email}</p>
        </div>
      </td>
      {entry.propertyTitle && (
        <td className="px-4 py-3 text-xs text-muted-foreground italic">{entry.propertyTitle}</td>
      )}
      {!entry.propertyTitle && (
        <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
      )}
      <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">
        ${entry.amount}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {METHOD_LABELS[entry.paymentMethod] ?? entry.paymentMethod}
      </td>
      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{confirmedAt}</td>
    </tr>
  );
}

// ── Group by month ────────────────────────────────────────────────────────────

function groupByMonth(entries: PaymentHistoryEntry[]) {
  const groups: Array<{ month: string; total: number; entries: PaymentHistoryEntry[] }> = [];
  let currentMonth = "";
  let currentGroup: PaymentHistoryEntry[] = [];
  let currentTotal = 0;

  for (const e of entries) {
    if (!e.confirmedAt) continue;
    const d = new Date(e.confirmedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key !== currentMonth) {
      if (currentMonth) {
        groups.push({ month: currentMonth, total: currentTotal, entries: currentGroup });
      }
      currentMonth = key;
      currentGroup = [];
      currentTotal = 0;
    }
    currentGroup.push(e);
    currentTotal += e.amount;
  }
  if (currentMonth) {
    groups.push({ month: currentMonth, total: currentTotal, entries: currentGroup });
  }
  return groups;
}

// ── Main component ────────────────────────────────────────────────────────────

type Period = "all" | "this_month" | "last_month" | "last_3_months";

export default function HistoriquePage() {
  const t = useTranslation().subscriptions;
  const [period, setPeriod] = useState<Period>("all");
  const { data: entries = [], isLoading } = useCombinedPaymentHistory(
    period !== "all" ? period : undefined,
  );

  const periodOptions: { key: Period; label: string }[] = [
    { key: "all",           label: t.periodAll },
    { key: "this_month",    label: t.periodThisMonth },
    { key: "last_month",    label: t.periodLastMonth },
    { key: "last_3_months", label: t.periodLast3 },
  ];

  const groups = groupByMonth(entries);
  const grandTotal = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.historiqueTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.historiqueSubtitle}</p>
      </div>

      {/* Period filter + total */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {periodOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                period === key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {entries.length > 0 && (
          <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            Total: ${grandTotal.toFixed(2)}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <Loading label={t.historiqueLoading} />
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <X className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">{t.historiqueEmpty}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colType}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colName}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Propriété</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colAmount}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colPayment}</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{t.colDate}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <React.Fragment key={group.month}>
                    <MonthSeparator month={group.month} total={group.total} />
                    {group.entries.map((entry) => (
                      <PaymentRow key={entry.id} entry={entry} />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground px-4 py-2 border-t border-border">
            {entries.length} paiement{entries.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
