"use client";

import EntitiesCount from "./molecules/entities-count";
import QuickActions from "./molecules/quick-actions";
import RecentAuditLogs from "./molecules/recent-audit-logs";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 mx-auto w-full">
      <EntitiesCount />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        <div className="lg:col-span-3">
          <RecentAuditLogs />
        </div>
      </div>
    </div>
  );
}
