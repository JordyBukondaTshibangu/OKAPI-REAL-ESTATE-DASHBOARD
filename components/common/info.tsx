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

type DialogInfoType = {
  open: boolean;
  title: string;
  description: string;
  buttonText: string;

  onOpenChange?: (open: boolean) => void;
};
function DialogInfo({
  open,
  title,
  buttonText,
  description,
  onOpenChange,
}: DialogInfoType) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button className="min-w-14.75 bg-gradient-primary hover:bg-gradient-secondary">
              {buttonText}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DialogInfo;
