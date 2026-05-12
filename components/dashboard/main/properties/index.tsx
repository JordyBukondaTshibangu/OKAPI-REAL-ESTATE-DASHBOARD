"use client";

import { CirclePlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/constants";
import { useProperties } from "@/lib/queries/properties";
import { usePropertyStore } from "@/lib/stores/properties";
import { SEARCH_TYPE } from "@/types";
import EmptyTable from "../_common/empty-table";
import SearchInput from "../_common/molecules/search-input";
import PropertiesTable, { PropertyDialogType } from "../_common/properties-table";
import AddProperty from "./dialogs/create-agent/add-agent";
import DeletePropertyDialog from "./dialogs/delete-agent";

const SEARCH_OPTIONS = ["Name", "All Fields"];

function Properties() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const {
    selectedProperty,
    dialogs,
    params,
    setSelectedProperty,
    toggleDialog,
    setParams,
  } = usePropertyStore();

  const currentPage = Math.max(1, Number(urlSearchParams.get("queryPage") ?? "1"));

  const queryParams = { ...params, page: currentPage, pageSize: PAGE_SIZE };

  const { data, isLoading } = useProperties(queryParams);

  const properties = Array.isArray(data?.data) ? data.data : [];
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

  const hasNoResults = properties.length === 0;
  const isSearchActive = Boolean(params?.search || params?.searchName);
  const showGlobalEmptyState = !isLoading && hasNoResults && !isSearchActive;

  return (
    <>
      {showGlobalEmptyState ? (
        <EmptyTable
          buttonText="Create Property"
          title="No Properties created yet!"
          description="Add your first property listing to get started."
          buttonOnClick={() => toggleDialog("addProperty", true)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {isLoading && <Loading label="Loading Properties" />}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 bg-brand-navy rounded-full" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Properties</h1>
                <p className="text-xs text-muted-foreground">Manage your property listings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                reset={handleReset}
                setParams={setParams}
                type={SEARCH_TYPE.PROPERTY}
                options={SEARCH_OPTIONS}
                setCurrentPage={(page: number | ((prev: number) => number)) => handlePageChange(typeof page === "function" ? page(currentPage) : page)}
              />
              <Button onClick={() => toggleDialog("addProperty", true)} className="h-9 px-4">
                <CirclePlus />
                Add Property
              </Button>
            </div>
          </div>

          <PropertiesTable
            properties={properties}
            totalPages={totalPages}
            totalCount={totalCount}
            currentPage={currentPage}
            searchParams={params}
            selectedAgent={selectedProperty}
            onPageChange={handlePageChange}
            onSortChange={handleSortingChange}
            setSelectedAgency={setSelectedProperty}
            emptyMessage={isSearchActive && hasNoResults ? "No results found" : undefined}
            toggleDialog={(key: PropertyDialogType, value: boolean) => toggleDialog(key, value)}
          />
        </div>
      )}

      <DeletePropertyDialog
        property={selectedProperty!}
        currentPage={currentPage}
        open={dialogs.deleteProperty}
        setOpen={(v) => toggleDialog("deleteProperty", v)}
        onClose={() => toggleDialog("deleteProperty", false)}
      />

      <AddProperty
        open={dialogs.addProperty}
        resetCurrentPage={() => handlePageChange(1)}
        setToggle={(v: boolean) => toggleDialog("addProperty", v)}
      />
    </>
  );
}

export default Properties;
