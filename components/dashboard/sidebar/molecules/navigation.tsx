"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

type SidebarItem = {
  title: string;
  url: string;
  icon?: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

export default function SidebarListContent({
  header,
  items,
}: {
  header?: string;
  items: SidebarItem[];
  type?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (url: string) => router.push(url || "/");

  return (
    <SidebarGroup className="pt-0">
      {header && (
        <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-semibold px-3 mb-1">
          {header}
        </SidebarGroupLabel>
      )}

      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length);
          const isActive =
            pathname === item.url ||
            (item.url !== "/" && pathname.startsWith(item.url)) ||
            (hasChildren &&
              item.items!.some((sub) => pathname.startsWith(sub.url)));

          const IconComponent = item.icon;

          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.isActive || isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => { if (!hasChildren) navigate(item.url); }}
                    className={cn(
                      "cursor-pointer rounded-lg mx-1 transition-all duration-150",
                      "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20",
                      isActive && !hasChildren && [
                        "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                        "shadow-sm",
                      ],
                    )}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={cn(
                          "shrink-0",
                          isActive && !hasChildren
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/50",
                        )}
                      />
                    )}
                    <span>{item.title}</span>

                    {/* Gold active indicator dot */}
                    {isActive && !hasChildren && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary shrink-0" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {hasChildren && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((subItem) => {
                        const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url);
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              onClick={() => navigate(subItem.url)}
                              className={cn(
                                "cursor-pointer transition-colors",
                                isSubActive
                                  ? "text-sidebar-primary font-semibold"
                                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                              )}
                            >
                              {subItem.title}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
