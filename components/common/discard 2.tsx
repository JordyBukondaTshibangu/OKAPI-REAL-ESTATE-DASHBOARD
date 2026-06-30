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

type DialogDiscardType = {
  open: boolean;
  title: string;
  description: string;
  onClose?: () => void;
  onDiscard?: () => void;
  onOpenChange?: (open: boolean) => void;
};
function DialogDiscard({
  open,
  title,
  onClose,
  onDiscard,
  description,
  onOpenChange,
}: DialogDiscardType) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" className="w-30.5" onClick={onClose}>
            Keep editing
          </Button>
          <DialogClose asChild>
            <Button
              variant="destructive"
              className="w-22.5"
              onClick={onDiscard}
            >
              Discard
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogDiscard;
