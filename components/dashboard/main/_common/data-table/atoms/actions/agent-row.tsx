"use client";

import { MoreVertical, PenLine, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Agent } from "@/types";
import { AgentDialogType } from "@/components/dashboard/main/_common/data-table/molecules/columns/agent-column";

type AgentRowActionsProps = {
  agent: Agent;
  toggleDialog: (key: AgentDialogType, value: boolean) => void;
  setSelectedAgent: (agent: Agent) => void;
};

export function AgentRowActions({ agent, toggleDialog, setSelectedAgent }: AgentRowActionsProps) {
  const router = useRouter();

  const handleView = useCallback(() => {
    router.push(`/agents/${agent.id}`);
  }, [agent.id, router]);

  const handleDelete = useCallback(() => {
    setSelectedAgent(agent);
    toggleDialog("deleteAgent", true);
  }, [agent, setSelectedAgent, toggleDialog]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 p-0" aria-label="More options">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 mr-10" align="start">
        <DropdownMenuItem onClick={handleView} className="cursor-pointer">
          <PenLine className="size-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive hover:text-destructive cursor-pointer"
        >
          <Trash2 className="size-4 text-destructive" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
