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

type PropertyColLabels = {
  colTitle: string; colType: string; colCategory: string; colDuree: string;
  colPrice: string; colCity: string; colAgent: string;
  actionView: string; actionDelete: string;
  longTerm: string; shortTerm: string;
};

export function getResourcesColumns(
  currentPage: number,
  toggleDialog?: (key: PropertyDialogType, value: boolean) => void,
  setSelectedResource?: (property: Property) => void,
  searchParams?: { search?: string; searchName?: string },
  labels?: PropertyColLabels,
): ColumnDef<Property>[] {
  const nameQuery = searchParams?.searchName ?? "";
  const genericQuery = searchParams?.search ?? "";
  const L = labels ?? {
    colTitle: "Title", colType: "Type", colCategory: "Category", colDuree: "Duration",
    colPrice: "Price", colCity: "City", colAgent: "Agent",
    actionView: "View", actionDelete: "Delete", longTerm: "Long-term", shortTerm: "Short-term",
  };

  return [
    {
      accessorKey: "title",
      size: 220,
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title={L.colTitle} />,
      cell: ({ row }) => (
        <span className="font-medium truncate block max-w-full" title={safeString(row.original.title)}>
          <HighlightText text={safeString(row.original.title)} query={nameQuery || genericQuery} />
        </span>
      ),
    },
    {
      accessorKey: "listingType",
      size: 90,
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title={L.colType} />,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-xs whitespace-nowrap">
          {safeString(row.original.listingType)}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      size: 110,
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title={L.colCategory} />,
      cell: ({ row }) => (
        <span className="capitalize">{safeString(row.original.category)}</span>
      ),
    },
    {
      id: "rentalType",
      size: 120,
      enableSorting: true,
      accessorFn: (row) => {
        if (row.isShortTerm && !(row.isLongTerm ?? true)) return 2;
        if (row.isShortTerm) return 1;
        return 0;
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={L.colDuree} />,
      cell: ({ row }) => {
        const { isShortTerm, isLongTerm } = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {(isLongTerm ?? true) && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium whitespace-nowrap">
                {L.longTerm}
              </Badge>
            )}
            {isShortTerm && (
              <Badge className="text-[10px] px-1.5 py-0 h-5 font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0 whitespace-nowrap">
                {L.shortTerm}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      size: 120,
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title={L.colPrice} />,
      cell: ({ row }) => {
        const price = row.original.price;
        const currency = safeString(row.original.currency);
        const displayPrice = typeof price === "number" ? price.toLocaleString() : "–";
        return <span className="whitespace-nowrap tabular-nums">{currency} {displayPrice}</span>;
      },
    },
    {
      accessorKey: "city",
      size: 100,
      enableSorting: false,
      header: L.colCity,
      cell: ({ row }) => <span>{safeString(row.original.city)}</span>,
    },
    {
      accessorKey: "agent",
      size: 170,
      enableSorting: false,
      header: L.colAgent,
      cell: ({ row }) => <span className="truncate block max-w-full">{resolveAgentName(row.original.agent)}</span>,
    },
    {
      id: "actions",
      size: 140,
      enableSorting: false,
      cell: ({ row }) => (
        <PropertyRowActions
          property={row.original}
          currentPage={currentPage}
          toggleDialog={toggleDialog}
          setSelectedProperty={setSelectedResource}
          labelView={L.actionView}
          labelDelete={L.actionDelete}
        />
      ),
    },
  ];
}
