"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { removeToken } from "@/lib/auth";
import { useTranslation } from "@/hooks/use-translation";

export default function SideBarFooter() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslation();

  function handleSignOut() {
    removeToken();
    router.push("/login");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent/20 hover:bg-sidebar-accent/20 transition-colors rounded-lg"
            >
              {/* Gold avatar monogram */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-brand-navy font-bold text-sm shrink-0">
                O
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  Okapi Real Estate
                </span>
                <span className="truncate text-xs text-sidebar-foreground/50">
                  {t.sidebar.admin}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <div className="px-2 py-2">
              <p className="text-sm font-semibold">Okapi Real Estate</p>
              <p className="text-xs text-muted-foreground">admin@okapi.re</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 size-4" />
              {t.sidebar.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
