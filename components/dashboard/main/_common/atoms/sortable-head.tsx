import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MoveUp } from "lucide-react";

export type SortDirection = "asc" | "desc";

export function SortableHead<T extends string>({
  label,
  sortKeyValue,
  currentSortKey,
  currentSortDir,
  onSort,
  className,
}: {
  label: string;
  sortKeyValue: T;
  currentSortKey: T | null;
  currentSortDir: SortDirection;
  onSort: (key: T) => void;
  className?: string;
}) {
  const isActive = currentSortKey === sortKeyValue;

  return (
    <TableHead
      className={cn("cursor-pointer select-none", className)}
      onClick={() => onSort(sortKeyValue)}
    >
      <div className="flex items-center gap-2">
        {label}
        <MoveUp
          size={16}
          className={cn(
            "transition-all duration-200",
            isActive
              ? "opacity-100 text-foreground"
              : "opacity-30 text-muted-foreground",
            isActive && currentSortDir === "desc" && "rotate-180",
          )}
        />
      </div>
    </TableHead>
  );
}
