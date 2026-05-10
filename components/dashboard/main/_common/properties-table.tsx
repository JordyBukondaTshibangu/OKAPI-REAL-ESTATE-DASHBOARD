"use client";

import { SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "./data-table";
import { getResourcesColumns, PropertyDialogType } from "./data-table/molecules/columns/property-column";
import { TablePagination } from "./table-pagination";
import { Property } from "@/types";

export type { PropertyDialogType };

const API_SORT_KEY_MAP: Record<string, string> = {
  title: "title",
  price: "price",
};

type PropertiesTableProps = {
  properties: Property[];
  emptyMessage?: string;
  selectedAgent?: Property | null;
  setSelectedAgency?: (property: Property) => void;
  toggleDialog?: (key: PropertyDialogType, value: boolean) => void;
  searchParams?: { search?: string; searchName?: string };
  currentPage: number;
  totalPages: number | null;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
};

function PropertiesTable({
  properties,
  totalPages,
  totalCount,
  currentPage,
  searchParams,
  emptyMessage,
  onPageChange,
  onSortChange,
  toggleDialog,
  setSelectedAgency,
}: PropertiesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => getResourcesColumns(currentPage, toggleDialog, setSelectedAgency, searchParams),
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
        data={properties}
        columns={columns}
        emptyMessage={emptyMessage ?? "No properties found"}
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
          entityLabel="properties"
        />
      )}
    </div>
  );
}

export default PropertiesTable;
