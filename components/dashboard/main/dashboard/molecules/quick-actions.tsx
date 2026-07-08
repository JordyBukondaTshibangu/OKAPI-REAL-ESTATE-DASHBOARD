"use client";

import { Building2, ClipboardList, Home, Search, Star, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AddAgent from "@/components/dashboard/main/agents/dialogs/create-agent/add-agent";
import AddAgency from "@/components/dashboard/main/agencies/dialogs/create-agency/add-agency";
import AddProperty from "@/components/dashboard/main/properties/dialogs/create-property/add-property";
import { useTranslation } from "@/hooks/use-translation";
import { usePendingAgentsCount } from "@/lib/queries/agents";

function QuickActions() {
  const router = useRouter();
  const t = useTranslation();
  const { data: pendingCount } = usePendingAgentsCount();
  const pending = typeof pendingCount === "number" && pendingCount > 0 ? pendingCount : null;
  const [dialogs, setDialogs] = useState({
    addAgent: false,
    addAgency: false,
    addProperty: false,
  });

  const toggleDialog = (key: keyof typeof dialogs, value: boolean) =>
    setDialogs((prev) => ({ ...prev, [key]: value }));

  const ACTIONS = [
    {
      key: "addAgent" as const,
      label: t.dashboard.addAgent,
      icon: Users,
      variant: "default" as const,
      description: t.dashboard.addAgentDesc,
    },
    {
      key: "addAgency" as const,
      label: t.dashboard.addAgency,
      icon: Building2,
      variant: "outline" as const,
      description: t.dashboard.addAgencyDesc,
    },
    {
      key: "addProperty" as const,
      label: t.dashboard.listProperty,
      icon: Home,
      variant: "outline" as const,
      description: t.dashboard.listPropertyDesc,
    },
  ];

  return (
    <>
      <Card className="card-luxury rounded-xl col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-4 bg-brand-gold rounded-full" />
            {t.dashboard.quickActions}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {ACTIONS.map(({ key, label, icon: Icon, variant, description }) => (
            <Button
              key={key}
              variant={variant}
              className="w-full h-auto py-3 px-4 justify-start gap-3 text-left"
              onClick={() => toggleDialog(key, true)}
            >
              <div className={`p-1.5 rounded-md shrink-0 ${variant === "default" ? "bg-white/20" : "bg-primary/10"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium leading-none">{label}</span>
                <span className={`text-[11px] leading-none ${variant === "default" ? "text-white/70" : "text-muted-foreground"}`}>
                  {description}
                </span>
              </div>
            </Button>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <Separator className="flex-1 opacity-50" />
            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
              Actions rapides
            </span>
            <Separator className="flex-1 opacity-50" />
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push("/agents/pending")}
            className="w-full justify-start gap-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-9"
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">File d&apos;approbation</span>
            {pending !== null && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shrink-0">
                {pending}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/properties?boosted=true")}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-9"
          >
            <Star className="w-4 h-4 shrink-0" />
            Gérer les boosts
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/properties")}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-9"
          >
            <Search className="w-4 h-4 shrink-0" />
            {t.dashboard.browseAllProperties}
          </Button>
        </CardContent>
      </Card>

      <AddAgent open={dialogs.addAgent} setToggle={(v) => toggleDialog("addAgent", v)} />
      <AddAgency open={dialogs.addAgency} setToggle={(v) => toggleDialog("addAgency", v)} />
      <AddProperty open={dialogs.addProperty} setToggle={(v) => toggleDialog("addProperty", v)} />
    </>
  );
}

export default QuickActions;
