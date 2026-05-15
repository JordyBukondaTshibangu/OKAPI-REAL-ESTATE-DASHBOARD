"use client";

import {
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import SideBarFooter from "./molecules/footer";
import SideBarHeaderContent from "./molecules/header";
import SidebarListContent from "./molecules/navigation";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

const navMain: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agents", url: "/agents", icon: Users },
  { title: "Agencies", url: "/agencies", icon: Building2 },
  { title: "Properties", url: "/properties", icon: Home },
  { title: "Audit Logs", url: "/audit-logs", icon: ClipboardList },
];

export default function SidebarLayout() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-sidebar-background">
        <SideBarHeaderContent />
      </SidebarHeader>

      <SidebarContent>
        <SidebarListContent items={navMain} type="dashboard" />
      </SidebarContent>

      <SidebarFooter>
        <SideBarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
