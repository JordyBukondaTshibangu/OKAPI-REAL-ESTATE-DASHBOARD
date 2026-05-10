"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/dashboard/main/_common/data-table/atoms/column-header";
import { AgencyRowActions } from "@/components/dashboard/main/_common/data-table/atoms/actions/agency-row";
import HighlightText from "@/components/dashboard/main/_common/atoms/highlight-text";
import { Agency } from "@/types";

export type AgencyDialogType = "deleteAgency" | "editAgency";

function safeString(val: unknown): string {
  if (val == null) return "–";
  if (typeof val === "object") return "–";
  return String(val);
}

function safeNumber(val: unknown): string {
  if (val == null) return "–";
  if (typeof val === "number") return String(val);
  return "–";
}

export function getAgenciesColumns(
  currentPage: number,
  type?: string,
  toggleDialog?: (key: AgencyDialogType, value: boolean) => void,
  setSelectedAgency?: (agency: Agency) => void,
  searchParams?: { search?: string; searchName?: string },
): ColumnDef<Agency>[] {
  const nameQuery = searchParams?.searchName ?? "";
  const genericQuery = searchParams?.search ?? "";

  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <span className="font-medium">
          <HighlightText text={safeString(row.original.name)} query={nameQuery || genericQuery} />
        </span>
      ),
    },
    {
      accessorKey: "email",
      enableSorting: false,
      header: "Email",
      cell: ({ row }) => <span>{safeString(row.original.email)}</span>,
    },
    {
      accessorKey: "phone",
      enableSorting: false,
      header: "Phone",
      cell: ({ row }) => <span>{safeString(row.original.phone)}</span>,
    },
    {
      accessorKey: "agentCount",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agents" />,
      cell: ({ row }) => <span>{safeNumber(row.original.agentCount)}</span>,
    },
    {
      accessorKey: "listingCount",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Listings" />,
      cell: ({ row }) => <span>{safeNumber(row.original.listingCount)}</span>,
    },
    {
      accessorKey: "founded",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Founded" />,
      cell: ({ row }) => <span>{safeNumber(row.original.founded)}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="w-2">
          <AgencyRowActions
            agency={row.original}
            currentPage={currentPage}
            toggleDialog={toggleDialog}
            setSelectedAgency={setSelectedAgency}
          />
        </div>
      ),
    },
  ];
}
