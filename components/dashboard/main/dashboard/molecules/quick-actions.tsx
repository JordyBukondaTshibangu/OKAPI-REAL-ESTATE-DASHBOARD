"use client";

import { Building2, Home, Search, Users } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AddAgent from "@/components/dashboard/main/agents/dialogs/create-agent/add-agent";
import AddAgency from "@/components/dashboard/main/agencies/dialogs/create-agency/add-agency";
import AddProperty from "@/components/dashboard/main/properties/dialogs/create-agent/add-agent";
import { useTranslation } from "@/hooks/use-translation";

function QuickActions() {
  const router = useRouter();
  const t = useTranslation();
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

          <Separator className="my-1 opacity-50" />

          <Button
            variant="ghost"
            onClick={() => router.push("/properties")}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-9"
          >
            <Search className="w-4 h-4" />
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
