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

type DeletePropertyDialogProps = {
  property: Property;
  open: boolean;
  currentPage?: number;
  onClose?: () => void;
  setOpen: (open: boolean) => void;
};

function DeletePropertyDialog({ open, property, setOpen, onClose }: DeletePropertyDialogProps) {
  const { mutateAsync: deleteProperty, isPending } = useDeleteProperty();

  const handleDelete = useCallback(async () => {
    try {
      await deleteProperty(property.id);
      toast.success(`Property "${property.title}" deleted`);
      setOpen(false);
      onClose?.();
    } catch {
      toast.error("Failed to delete property. Please try again.");
    }
  }, [property, deleteProperty, setOpen, onClose]);

  return (
    <>
      {isPending ? (
        <Loading label="Deleting property" />
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-4">
              <DialogTitle>Delete {property?.title}?</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm leading-normal">
                This action cannot be undone. The property will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                Delete property
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default DeletePropertyDialog;
