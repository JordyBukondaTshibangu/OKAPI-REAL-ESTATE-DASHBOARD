"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/dashboard/main/_common/data-table/atoms/column-header";
import { PropertyRowActions } from "@/components/dashboard/main/_common/data-table/atoms/actions/property-row";
import HighlightText from "@/components/dashboard/main/_common/atoms/highlight-text";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types";

export type PropertyDialogType = "deleteProperty" | "editProperty";

function safeString(val: unknown): string {
  if (val == null) return "–";
  if (typeof val === "object") return "–";
  return String(val);
}

// agent field may come as an object {name, title, profile} or a plain string
function resolveAgentName(agent: unknown): string {
  if (!agent) return "–";
  if (typeof agent === "string") return agent;
  if (typeof agent === "object" && agent !== null && "name" in agent) {
    return String((agent as Record<string, unknown>).name ?? "–");
  }
  return "–";
}

export function getResourcesColumns(
  currentPage: number,
  toggleDialog?: (key: PropertyDialogType, value: boolean) => void,
  setSelectedResource?: (property: Property) => void,
  searchParams?: { search?: string; searchName?: string },
): ColumnDef<Property>[] {
  const nameQuery = searchParams?.searchName ?? "";
  const genericQuery = searchParams?.search ?? "";

  return [
    {
      accessorKey: "title",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <span className="font-medium max-w-48 truncate block">
          <HighlightText text={safeString(row.original.title)} query={nameQuery || genericQuery} />
        </span>
      ),
    },
    {
      accessorKey: "listingType",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-xs w-20">
          {safeString(row.original.listingType)}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <span className="capitalize">{safeString(row.original.category)}</span>
      ),
    },
    {
      id: "rentalType",
      enableSorting: true,
      // Sort key: 0 = long only, 1 = both, 2 = short only
      accessorFn: (row) => {
        if (row.isShortTerm && !(row.isLongTerm ?? true)) return 2;
        if (row.isShortTerm) return 1;
        return 0;
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durée" />,
      cell: ({ row }) => {
        const { isShortTerm, isLongTerm } = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {(isLongTerm ?? true) && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                Long terme
              </Badge>
            )}
            {isShortTerm && (
              <Badge className="text-[10px] px-1.5 py-0 h-5 font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0">
                Court terme
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => {
        const price = row.original.price;
        const currency = safeString(row.original.currency);
        const displayPrice = typeof price === "number" ? price.toLocaleString() : "–";
        return <span>{currency} {displayPrice}</span>;
      },
    },
    {
      accessorKey: "city",
      enableSorting: false,
      header: "City",
      cell: ({ row }) => <span>{safeString(row.original.city)}</span>,
    },
    {
      accessorKey: "agent",
      enableSorting: false,
      header: "Agent",
      cell: ({ row }) => <span>{resolveAgentName(row.original.agent)}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="w-2">
          <PropertyRowActions
            property={row.original}
            currentPage={currentPage}
            toggleDialog={toggleDialog}
            setSelectedProperty={setSelectedResource}
          />
        </div>
      ),
    },
  ];
}
