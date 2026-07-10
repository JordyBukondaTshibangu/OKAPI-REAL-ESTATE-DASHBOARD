"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  isSelectable?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  resetSelection?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage,
  isSelectable = false,
  sorting = [],
  onSortingChange,
  rowSelection = {},
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    manualSorting: true,
    sortDescFirst: false,
    manualPagination: true,
    state: { sorting, rowSelection },
    enableRowSelection: isSelectable,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      onRowSelectionChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="table-header-brand border-b border-border/80 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "text-[13px] font-medium text-muted-foreground uppercase tracking-wider py-3.5 px-5",
                    header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground transition-colors",
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  "hover:bg-muted/40",
                  i % 2 === 0 ? "bg-card" : "bg-card/60",
                  row.getIsSelected() && "bg-primary/5",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 text-sm px-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-muted-foreground text-sm">{emptyMessage ?? "No results found"}</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
