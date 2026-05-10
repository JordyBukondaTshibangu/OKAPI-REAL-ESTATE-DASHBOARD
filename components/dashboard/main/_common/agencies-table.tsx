"use client";

import { Agency } from "@/types";
import { SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "./data-table";
import {
  AgencyDialogType,
  getAgenciesColumns,
} from "./data-table/molecules/columns/agency-column";
import { TablePagination } from "./table-pagination";

export type { AgencyDialogType };

const API_SORT_KEY_MAP: Record<string, string> = {
  name: "name",
  agentCount: "agent_count",
  founded: "founded",
};

type AgencyTableProps = {
  agencies: Agency[];
  emptyMessage?: string;
  selectedAgency?: Agency | null;
  setSelectedAgency?: (agency: Agency) => void;
  toggleDialog?: (key: AgencyDialogType, value: boolean) => void;
  searchParams?: { search?: string; searchName?: string };
  currentPage: number;
  totalPages: number | null;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
};

function AgenciesTable({
  agencies,
  totalPages,
  totalCount,
  currentPage,
  searchParams,
  emptyMessage,
  onPageChange,
  onSortChange,
  toggleDialog,
  setSelectedAgency,
}: AgencyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () =>
      getAgenciesColumns(
        currentPage,
        undefined,
        toggleDialog,
        setSelectedAgency,
        searchParams,
      ),
    [currentPage, toggleDialog, setSelectedAgency, searchParams],
  );

  const handleSortingChange = (next: SortingState) => {
    setSorting(next);
    if (next.length > 0) {
      const { id, desc } = next[0];
      onSortChange?.(API_SORT_KEY_MAP[id] ?? id, desc ? "desc" : "asc");
    } else {
      onSortChange?.("", "asc");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        data={agencies}
        columns={columns}
        emptyMessage={emptyMessage ?? "No agencies found"}
        sorting={sorting}
        onSortingChange={handleSortingChange}
      />

      {/* Always render pagination once data is available */}
      {totalPages != null && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={onPageChange}
          entityLabel="agencies"
        />
      )}
    </div>
  );
}

export default AgenciesTable;
