import { cn } from "@/lib/utils";
import { Column } from "@tanstack/react-table";
import { ArrowUpDown, MoveUp } from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn(className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  const handleSort = () => {
    if (sorted === "asc") {
      column.toggleSorting(true);
    } else if (sorted === "desc") {
      column.clearSorting();
    } else {
      column.toggleSorting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 cursor-pointer select-none",
        className,
      )}
      onClick={handleSort}
    >
      {title}
      {sorted ? (
        <MoveUp
          size={16}
          className={cn(
            "transition-all duration-200 text-foreground",
            sorted === "desc" && "rotate-180",
          )}
        />
      ) : (
        <ArrowUpDown size={16} className="text-muted-foreground opacity-40" />
      )}
    </div>
  );
}
