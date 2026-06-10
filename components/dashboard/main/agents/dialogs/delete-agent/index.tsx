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
import { useTranslation } from "@/hooks/use-translation";

type DeleteAgentDialogProps = {
  agent: Agent;
  open: boolean;
  currentPage?: number;
  onClose?: () => void;
  setOpen: (open: boolean) => void;
};

function DeleteAgentDialog({ open, agent, setOpen, onClose }: DeleteAgentDialogProps) {
  const t = useTranslation();
  const f = t.forms.agent;

  const { mutateAsync: deleteAgent, isPending } = useDeleteAgent();

  const handleDelete = useCallback(async () => {
    try {
      await deleteAgent(agent.id);
      toast.success(f.toast.deleted.replace("{name}", agent.name));
      setOpen(false);
      onClose?.();
    } catch {
      toast.error(f.toast.deleteFailed);
    }
  }, [agent, deleteAgent, setOpen, onClose, f]);

  return (
    <>
      {isPending ? (
        <Loading label={f.toast.deleting} />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-4">
              <DialogTitle>Delete {agent?.name}?</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-normal">
                {f.delete.description}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onClose}>
                  {t.forms.common.cancel}
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                {f.delete.button}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default DeleteAgentDialog;
