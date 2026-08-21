"use client";

import {
  Building2,
  ClipboardList,
  CreditCard,
  Flag,
  Home,
  LayoutDashboard,
  Rocket,
  Settings,
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
import { useTranslation } from "@/hooks/use-translation";

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

export default function SidebarLayout() {
  const t = useTranslation();

  const navMain: NavItem[] = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: t.nav.agents, url: "/agents", icon: Users },
    { title: t.nav.agencies, url: "/agencies", icon: Building2 },
    { title: t.nav.properties, url: "/properties", icon: Home },
    { title: t.nav.boosts, url: "/boosts", icon: Rocket },
    { title: t.nav.reports, url: "/reports", icon: Flag },
    {
      title: t.nav.subscriptions,
      url: "/subscriptions",
      icon: CreditCard,
      items: [
        { title: t.nav.subscriptionsAgents, url: "/subscriptions/agents" },
        { title: t.nav.subscriptionsAgences, url: "/subscriptions/agences" },
        { title: t.nav.subscriptionsHistorique, url: "/subscriptions/historique" },
      ],
    },
    { title: t.nav.auditLogs, url: "/audit-logs", icon: ClipboardList },
    { title: t.settings.title, url: "/settings", icon: Settings },
  ];

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
