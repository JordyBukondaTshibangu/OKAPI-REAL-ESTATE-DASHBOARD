"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, " ");
}

const HEADER_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  agents: "Agents",
  agencies: "Agencies",
  properties: "Properties",
};

export default function MainHeaderLayout() {
  const pathname = usePathname();

  const pathSegments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const currentPage = pathSegments[0] ?? "dashboard";
  const detailId = pathSegments[1];

  const headerTitle = HEADER_TITLES[currentPage] ?? capitalize(currentPage);

  return (
    <header className="w-full absolute top-0 right-0 z-20">
      <div className="w-full px-4 h-20">
        <div className="flex w-[70%] md:w-[78%] xl:w-[82%] 2xl:w-[85%] 3xl:w-[88%] fixed items-center justify-between px-8 py-5 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">

          <h1 className="text-sm font-semibold capitalize text-foreground flex items-center gap-2">
            <span className="text-muted-foreground">{headerTitle}</span>
            {detailId && (
              <>
                <ChevronRight className="size-3.5 text-brand-gold" />
                <span className="text-foreground">{detailId}</span>
              </>
            )}
          </h1>

          <div className="flex items-center gap-3 pr-5">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-foreground leading-tight">
                  Okapi Real Estate
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Admin Dashboard
                </span>
              </div>
              <Avatar className="h-9 w-9 rounded-lg border-2 border-brand-gold/30">
                <AvatarFallback className="rounded-lg bg-brand-navy text-brand-gold font-bold text-sm">
                  O
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
