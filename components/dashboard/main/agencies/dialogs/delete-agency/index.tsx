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
import { useTranslation } from "@/hooks/use-translation";

type DeleteAgencyDialogProps = {
  agency: Agency;
  open: boolean;
  currentPage?: number;
  onClose?: () => void;
  setOpen: (open: boolean) => void;
};

function DeleteAgencyDialog({ open, agency, setOpen, onClose }: DeleteAgencyDialogProps) {
  const t = useTranslation();
  const f = t.forms.agency;

  const { mutateAsync: deleteAgency, isPending } = useDeleteAgency();

  const handleDelete = useCallback(async () => {
    try {
      await deleteAgency(agency.id);
      toast.success(f.toast.deleted.replace("{name}", agency.name));
      setOpen(false);
      onClose?.();
    } catch {
      toast.error(f.toast.deleteFailed);
    }
  }, [agency, deleteAgency, setOpen, onClose, f]);

  return (
    <>
      {isPending ? (
        <Loading label={f.toast.deleting} />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-4">
              <DialogTitle>Delete {agency?.name}?</DialogTitle>
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

export default DeleteAgencyDialog;
