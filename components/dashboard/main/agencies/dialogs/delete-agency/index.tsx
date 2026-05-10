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
import { Agency } from "@/types";
import { useDeleteAgency } from "@/lib/queries/agencies";

type DeleteAgencyDialogProps = {
  agency: Agency;
  open: boolean;
  currentPage?: number;
  onClose?: () => void;
  setOpen: (open: boolean) => void;
};

function DeleteAgencyDialog({ open, agency, setOpen, onClose }: DeleteAgencyDialogProps) {
  const { mutateAsync: deleteAgency, isPending } = useDeleteAgency();

  const handleDelete = useCallback(async () => {
    try {
      await deleteAgency(agency.id);
      toast.success(`Agency "${agency.name}" deleted`);
      setOpen(false);
      onClose?.();
    } catch {
      toast.error("Failed to delete agency. Please try again.");
    }
  }, [agency, deleteAgency, setOpen, onClose]);

  return (
    <>
      {isPending ? (
        <Loading label="Deleting agency" />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-4">
              <DialogTitle>Delete {agency?.name}?</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-normal">
                This action cannot be undone. The agency will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                Delete agency
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default DeleteAgencyDialog;
