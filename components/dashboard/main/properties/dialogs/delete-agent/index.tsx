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
import { Property } from "@/types";
import { useDeleteProperty } from "@/lib/queries/properties";
import { useTranslation } from "@/hooks/use-translation";

type DeletePropertyDialogProps = {
  property: Property;
  open: boolean;
  currentPage?: number;
  onClose?: () => void;
  setOpen: (open: boolean) => void;
};

function DeletePropertyDialog({ open, property, setOpen, onClose }: DeletePropertyDialogProps) {
  const t = useTranslation();
  const f = t.forms.property;

  const { mutateAsync: deleteProperty, isPending } = useDeleteProperty();

  const handleDelete = useCallback(async () => {
    try {
      await deleteProperty(property.id);
      toast.success(f.toast.deleted.replace("{name}", property.title));
      setOpen(false);
      onClose?.();
    } catch {
      toast.error(f.toast.deleteFailed);
    }
  }, [property, deleteProperty, setOpen, onClose, f]);

  return (
    <>
      {isPending ? (
        <Loading label={f.toast.deleting} />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-4">
              <DialogTitle>Delete {property?.title}?</DialogTitle>
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

export default DeletePropertyDialog;
