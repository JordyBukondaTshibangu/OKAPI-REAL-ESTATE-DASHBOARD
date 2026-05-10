"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";
import { RootState } from "@/store";

import AddResource from "../../properties/dialogs/create-resource/add-resource";
import AddRouter from "../../routers/dialogs/create-router/add-router";
import CreateTeamDialog from "../../teams-and-members/dialogs/create-team";
import InviteMembersDialog from "../../teams-and-members/dialogs/invite-members";

type DialogKey =
  | "addRouter"
  | "addAgency"
  | "createTeam"
  | "addResource"
  | "inviteMembers";

interface DialogState {
  addRouter: boolean;
  addAgency: boolean;
  createTeam: boolean;
  addResource: boolean;
  inviteMembers: boolean;
}

function EntitiesSetupCTA() {
  const [dialogs, setDialogs] = useState<DialogState>({
    addRouter: false,
    addAgency: false,
    createTeam: false,
    addResource: false,
    inviteMembers: false,
  });

  const { policyCount, resourceCount, teamsCount, membersCount } = useSelector(
    (state: RootState) => state.adminDashboardInfo.data,
  );

  const { items: routers } = useSelector(
    (state: RootState) => state.adminRouters.routers,
  );

  const completedSteps = useMemo(() => {
    let count = 0;
    if (routers.length > 0) count++;
    if (resourceCount > 0) count++;
    if (membersCount > 0) count++;
    if (teamsCount > 0) count++;
    if (policyCount > 0) count++;
    return count;
  }, [membersCount, policyCount, resourceCount, routers.length, teamsCount]);

  const hasTeam = teamsCount > 0;
  const hasPolicy = policyCount > 0;
  const hasMember = membersCount > 0;
  const hasRouter = routers.length > 0;
  const hasResource = resourceCount > 0;

  const shouldShowButton = (stepId: string) => {
    if (stepId === "router") {
      return !hasRouter;
    }
    if (stepId === "resource") {
      return hasRouter && !hasResource;
    }
    if (stepId === "member") {
      return hasRouter && hasResource && !hasMember;
    }
    if (stepId === "team") {
      return hasRouter && hasResource && hasMember && !hasTeam;
    }
    if (stepId === "policy") {
      return hasRouter && hasResource && hasMember && hasTeam && !hasPolicy;
    }
    return false;
  };

  const toggleDialog = (key: DialogKey, value: boolean) =>
    setDialogs((prev) => ({ ...prev, [key]: value }));

  const steps = [
    {
      id: "router",
      label: "Set up your router",
      completed: hasRouter,
      buttonText: "Set up your router",
      dialogKey: "addRouter" as DialogKey,
    },
    {
      id: "resource",
      label: "Add your first resource",
      completed: hasResource,
      buttonText: "Add Resource",
      dialogKey: "addResource" as DialogKey,
    },
    {
      id: "member",
      label: "Invite a member",
      completed: hasMember,
      buttonText: "Invite Members",
      dialogKey: "inviteMembers" as DialogKey,
    },
    {
      id: "team",
      label: "Create a team",
      completed: hasTeam,
      buttonText: "Create Team",
      dialogKey: "createTeam" as DialogKey,
    },
    {
      id: "policy",
      label: "Create your first policy",
      completed: hasPolicy,
      buttonText: "Create Policy",
      dialogKey: "addAgency" as DialogKey,
    },
  ];

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-8 rounded-xl border border-border bg-muted/20 px-5 pl-6 py-4",
          completedSteps === 5 && "hidden",
        )}
      >
        <div className="flex flex-col gap-0">
          <h2 className="text-lg leading-normal font-semibold">
            Get your workspace ready
          </h2>
          <p className="text-sm leading-normal font-normal text-foreground">
            <span className="font-bold">{completedSteps} of 5 </span>steps
            completed
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <div key={step.id}>
              <div className="flex justify-between">
                <div className="flex items-center gap-4 h-11">
                  <Checkbox
                    checked={step.completed}
                    className={cn("size-6 rounded-full border border-border", {
                      "bg-primary": step.completed,
                    })}
                  />
                  <p className="text-base leading-normal font-normal text-muted-foreground">
                    {step.label}
                  </p>
                </div>

                {shouldShowButton(step.id) && (
                  <Button
                    className="bg-gradient-primary w-37.25"
                    onClick={() => toggleDialog(step.dialogKey, true)}
                  >
                    {step.buttonText}
                  </Button>
                )}
              </div>

              {index < steps.length - 1 && (
                <Separator
                  orientation="horizontal"
                  className="w-full bg-border h-px my-3"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {dialogs.addRouter && (
        <AddRouter
          origin="DASHBOARD"
          open={dialogs.addRouter}
          setToggle={(v: boolean) => toggleDialog("addRouter", v)}
        />
      )}

      {dialogs.addAgency && (
        <addAgency
          origin="DASHBOARD"
          open={dialogs.addAgency}
          setToggle={(v: boolean) => toggleDialog("addAgency", v)}
        />
      )}

      {dialogs.addResource && (
        <AddResource
          origin="DASHBOARD"
          open={dialogs.addResource}
          setToggle={(v: boolean) => toggleDialog("addResource", v)}
        />
      )}

      {dialogs.createTeam && (
        <CreateTeamDialog
          type="create"
          origin="DASHBOARD"
          open={dialogs.createTeam}
          setOpen={(v) => toggleDialog("createTeam", v)}
        />
      )}

      {dialogs.inviteMembers && (
        <InviteMembersDialog
          origin="DASHBOARD"
          open={dialogs.inviteMembers}
          setOpen={(v) => toggleDialog("inviteMembers", v)}
        />
      )}
    </>
  );
}

export default EntitiesSetupCTA;
