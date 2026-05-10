"use client";

import EntitiesCount from "./molecules/entities-count";
import QuickActions from "./molecules/quick-actions";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 mx-auto w-full">
      <EntitiesCount />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick actions takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Placeholder for future activity feed / charts */}
        <div className="lg:col-span-3 card-luxury rounded-xl p-6 flex items-center justify-center min-h-48">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              Activity Feed
            </p>
            <p className="text-xs text-muted-foreground">
              Recent activity will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
