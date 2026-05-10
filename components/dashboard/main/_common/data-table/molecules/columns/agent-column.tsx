"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/dashboard/main/_common/data-table/atoms/column-header";
import { AgentRowActions } from "@/components/dashboard/main/_common/data-table/atoms/actions/agent-row";
import HighlightText from "@/components/dashboard/main/_common/atoms/highlight-text";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/types";

export type AgentDialogType = "deleteAgent" | "editAgent";

// Backend may return agency as a nested object or as a plain string
function resolveAgencyName(agency: unknown): string {
  if (!agency) return "–";
  if (typeof agency === "string") return agency;
  if (typeof agency === "object" && agency !== null && "name" in agency) {
    return String((agency as Record<string, unknown>).name ?? "–");
  }
  return "–";
}

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

export function getAgentsColumns(
  toggleDialog: (key: AgentDialogType, value: boolean) => void,
  setSelectedAgent: (agent: Agent) => void,
  searchParams?: { search?: string; searchName?: string },
): ColumnDef<Agent>[] {
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
      accessorKey: "title",
      enableSorting: false,
      header: "Title",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-xs">
          {safeString(row.original.title)}
        </Badge>
      ),
    },
    {
      accessorKey: "agency",
      enableSorting: false,
      header: "Agency",
      cell: ({ row }) => <span>{resolveAgencyName(row.original.agency)}</span>,
    },
    {
      accessorKey: "specialization",
      enableSorting: false,
      header: "Specialization",
      cell: ({ row }) => <span>{safeString(row.original.specialization)}</span>,
    },
    {
      accessorKey: "rating",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
      cell: ({ row }) => (
        <span>
          {safeNumber(row.original.rating)} ({safeNumber(row.original.ratingsCount)})
        </span>
      ),
    },
    {
      accessorKey: "closedDeals",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Deals" />,
      cell: ({ row }) => <span>{safeNumber(row.original.closedDeals)}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="w-2">
          <AgentRowActions
            agent={row.original}
            toggleDialog={toggleDialog}
            setSelectedAgent={setSelectedAgent}
          />
        </div>
      ),
    },
  ];
}
