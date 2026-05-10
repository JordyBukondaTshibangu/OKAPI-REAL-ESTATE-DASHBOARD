import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyTableProps = {
  title: string;
  buttonText: string;
  description: string;
  buttonOnClick: () => void;
};

function EmptyTable({ title, description, buttonText, buttonOnClick }: EmptyTableProps) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-6">
      {/* Icon with brand ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-brand-gold/10 scale-150 blur-xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
          <PackageOpen className="w-7 h-7 text-brand-blue" />
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center text-center max-w-sm">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <Button onClick={buttonOnClick} size="lg" className="min-w-40">
        {buttonText}
      </Button>
    </div>
  );
}

export default EmptyTable;
