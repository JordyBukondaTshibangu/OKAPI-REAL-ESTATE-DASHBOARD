"use client";

import { CirclePlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/constants";
import { useAgencies } from "@/lib/queries/agencies";
import { useAgencyStore } from "@/lib/stores/agencies";
import { SEARCH_TYPE } from "@/types";
import AgenciesTable, { AgencyDialogType } from "../_common/agencies-table";
import EmptyTable from "../_common/empty-table";
import SearchInput from "../_common/molecules/search-input";
import AddAgency from "./dialogs/create-agency/add-agency";
import DeleteAgencyDialog from "./dialogs/delete-agency";

const SEARCH_OPTIONS = ["Name", "All Fields"];

function Agencies() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const {
    selectedAgency,
    dialogs,
    params,
    setSelectedAgency,
    toggleDialog,
    setParams,
  } = useAgencyStore();

  const currentPage = Math.max(1, Number(urlSearchParams.get("queryPage") ?? "1"));

  const queryParams = { ...params, page: currentPage, pageSize: PAGE_SIZE };

  const { data, isLoading } = useAgencies(queryParams);

  const agencies = Array.isArray(data?.data) ? data.data : [];
  const totalPages = typeof data?.totalPages === "number" ? data.totalPages : null;
  const totalCount = typeof data?.totalCount === "number" ? data.totalCount : undefined;

  const handlePageChange = useCallback(
    (page: number) => {
      const next = new URLSearchParams(urlSearchParams.toString());
      next.set("queryPage", String(page));
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, urlSearchParams],
  );

  const handleSortingChange = useCallback(
    (key: string, dir: "asc" | "desc") => {
      setParams({ ...params, sortBy: key || undefined, sortOrder: key ? dir : undefined });
      const next = new URLSearchParams(urlSearchParams.toString());
      next.set("queryPage", "1");
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [params, setParams, router, urlSearchParams],
  );

  const handleReset = useCallback(() => {
    setParams({});
    const next = new URLSearchParams();
    next.set("queryPage", "1");
    router.push(`?${next.toString()}`, { scroll: false });
  }, [setParams, router]);

  const hasNoResults = agencies.length === 0;
  const isSearchActive = Boolean(params?.search || params?.searchName);
  const showGlobalEmptyState = !isLoading && hasNoResults && !isSearchActive;

  return (
    <>
      {showGlobalEmptyState ? (
        <EmptyTable
          buttonText="Create Agency"
          title="No Agencies created yet!"
          description="Add your first agency to get started."
          buttonOnClick={() => toggleDialog("addAgency", true)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {isLoading && <Loading label="Loading Agencies" />}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 bg-brand-gold rounded-full" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Agencies</h1>
                <p className="text-xs text-muted-foreground">Manage your real estate agencies</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                reset={handleReset}
                setParams={setParams}
                type={SEARCH_TYPE.AGENCY}
                options={SEARCH_OPTIONS}
                setCurrentPage={(page: number | ((prev: number) => number)) => handlePageChange(typeof page === "function" ? page(currentPage) : page)}
              />
              <Button onClick={() => toggleDialog("addAgency", true)} className="h-9 px-4">
                <CirclePlus />
                Add Agency
              </Button>
            </div>
          </div>

          <AgenciesTable
            agencies={agencies}
            totalPages={totalPages}
            totalCount={totalCount}
            currentPage={currentPage}
            searchParams={params}
            selectedAgency={selectedAgency}
            onPageChange={handlePageChange}
            onSortChange={handleSortingChange}
            setSelectedAgency={setSelectedAgency}
            emptyMessage={isSearchActive && hasNoResults ? "No results found" : undefined}
            toggleDialog={(key: AgencyDialogType, value: boolean) => toggleDialog(key, value)}
          />
        </div>
      )}

      <DeleteAgencyDialog
        agency={selectedAgency!}
        currentPage={currentPage}
        open={dialogs.deleteAgency}
        setOpen={(v) => toggleDialog("deleteAgency", v)}
        onClose={() => toggleDialog("deleteAgency", false)}
      />

      <AddAgency
        open={dialogs.addAgency}
        resetCurrentPage={() => handlePageChange(1)}
        setToggle={(v: boolean) => toggleDialog("addAgency", v)}
      />
    </>
  );
}

export default Agencies;
