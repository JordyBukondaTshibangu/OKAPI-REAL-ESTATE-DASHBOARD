"use client";

import { useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { getAgentsColumns, AgentDialogType } from "./data-table/molecules/columns/agent-column";
import { TablePagination } from "./table-pagination";
import { Agent } from "@/types";

export type { AgentDialogType };

const API_SORT_KEY_MAP: Record<string, string> = {
  name: "name",
  rating: "rating",
  closedDeals: "closed_deals",
};

type AgentsTableProps = {
  agents: Agent[];
  emptyMessage?: string;
  currentPage: number;
  totalPages: number | null;
  totalCount?: number;
  searchParams?: { search?: string; searchName?: string };
  selectedAgent?: Agent | null;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  toggleDialog: (key: AgentDialogType, value: boolean) => void;
  setSelectedAgency: (agent: Agent) => void;
};

function AgentsTable({
  agents,
  totalPages,
  totalCount,
  currentPage,
  searchParams,
  emptyMessage,
  onPageChange,
  onSortChange,
  toggleDialog,
  setSelectedAgency,
}: AgentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => getAgentsColumns(toggleDialog, setSelectedAgency, searchParams),
    [toggleDialog, setSelectedAgency, searchParams],
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
        data={agents}
        columns={columns}
        sorting={sorting}
        emptyMessage={emptyMessage ?? "No agents found"}
        onSortingChange={handleSortingChange}
      />

      {/* Always render pagination once data is available */}
      {totalPages != null && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={onPageChange}
          entityLabel="agents"
        />
      )}
    </div>
  );
}

export default AgentsTable;
