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

type ExitDialogType = {
  open: boolean;
  onClose?: () => void;
  onExit?: () => void;
  onOpenChange?: (open: boolean) => void;
};
function ExitDialog({ open, onClose, onExit }: ExitDialogType) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-106.25 h-43.5 [&>button]:hidden flex flex-col gap-4">
        <DialogHeader className="flex flex-col gap-4">
          <DialogTitle>Exit identity provider setup?</DialogTitle>
          <DialogDescription>
            If you leave now, the integration won’t be enabled. You can continue
            this later in the settings.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" className="w-35.35" onClick={onClose}>
            Continue setup
          </Button>
          <DialogClose asChild>
            <Button variant="destructive" className="w-26.5" onClick={onExit}>
              Exit setup
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExitDialog;
