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

function formatDate(iso?: string): string {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
    // NAME
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => (
        <span className="font-medium">
          <HighlightText text={safeString(row.original.name)} query={nameQuery || genericQuery} />
        </span>
      ),
    },

    // STATUS
    {
      accessorKey: "verificationTier",
      enableSorting: false,
      header: "Statut",
      cell: ({ row }) => {
        const tier = row.original.verificationTier;
        if (tier === "VERIFIE") {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              🟢 Vérifiée
            </span>
          );
        }
        if (tier === "NON_VERIFIE") {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              🟡 En attente
            </span>
          );
        }
        return <span className="text-[11px] text-muted-foreground">–</span>;
      },
    },

    // EMAIL
    {
      accessorKey: "email",
      enableSorting: false,
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm truncate max-w-[180px] block">{safeString(row.original.email)}</span>
      ),
    },

    // PHONE
    {
      accessorKey: "phone",
      enableSorting: false,
      header: "Téléphone",
      cell: ({ row }) => <span className="text-sm">{safeString(row.original.phone)}</span>,
    },

    // AGENTS
    {
      accessorKey: "agentCount",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agents" />,
      cell: ({ row }) => <span className="tabular-nums">{safeNumber(row.original.agentCount)}</span>,
    },

    // LISTINGS
    {
      accessorKey: "listingCount",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Annonces" />,
      cell: ({ row }) => <span className="tabular-nums">{safeNumber(row.original.listingCount)}</span>,
    },

    // DATE D'INSCRIPTION (replaces Founded)
    {
      accessorKey: "createdAt",
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Inscription" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },

    // ACTIONS
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
