"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/components/common/loading";
import { Agent } from "@/types";
import { useDeleteAgent } from "@/lib/queries/agents";

type DeleteAgentDialogProps = {
  agent: Agent;
  open: boolean;
  currentPage?: number;
  onClose?: () => void;
  setOpen: (open: boolean) => void;
};

function DeleteAgentDialog({ open, agent, setOpen, onClose }: DeleteAgentDialogProps) {
  const { mutateAsync: deleteAgent, isPending } = useDeleteAgent();

  const handleDelete = useCallback(async () => {
    try {
      await deleteAgent(agent.id);
      toast.success(`Agent "${agent.name}" deleted`);
      setOpen(false);
      onClose?.();
    } catch {
      toast.error("Failed to delete agent. Please try again.");
    }
  }, [agent, deleteAgent, setOpen, onClose]);

  return (
    <>
      {isPending ? (
        <Loading label="Deleting agent" />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-4">
              <DialogTitle>Delete {agent?.name}?</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-normal">
                This action cannot be undone. The agent will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                Delete agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default DeleteAgentDialog;
