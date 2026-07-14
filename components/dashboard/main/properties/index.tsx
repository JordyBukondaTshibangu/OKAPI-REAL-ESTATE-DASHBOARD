"use client";

import { CirclePlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_SIZE } from "@/constants";
import { useProperties, usePendingProperties } from "@/lib/queries/properties";
import { usePropertyStore } from "@/lib/stores/properties";
import { SEARCH_TYPE } from "@/types";
import EmptyTable from "../_common/empty-table";
import SearchInput from "../_common/molecules/search-input";
import PropertiesTable, { PropertyDialogType } from "../_common/properties-table";
import AddProperty from "./dialogs/create-property/add-property";
import DeletePropertyDialog from "./dialogs/delete-agent";
import PendingProperties from "./pending-properties";
import { useTranslation } from "@/hooks/use-translation";

const SEARCH_OPTIONS = ["Name", "All Fields"];

function Properties() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const t = useTranslation();

  const {
    selectedProperty,
    dialogs,
    params,
    setSelectedProperty,
    toggleDialog,
    setParams,
  } = usePropertyStore();

  const currentPage = Math.max(1, Number(urlSearchParams.get("queryPage") ?? "1"));
  const activeTab = urlSearchParams.get("tab") ?? "live";

  const queryParams = { ...params, page: currentPage, pageSize: PAGE_SIZE };

  const { data, isLoading } = useProperties(queryParams);
  const { data: pendingList = [] } = usePendingProperties();

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

  const handleTabChange = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(urlSearchParams.toString());
      next.set("tab", tab);
      next.set("queryPage", "1");
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, urlSearchParams],
  );

  const handleSortingChange = useCallback(
    (key: string, dir: "asc" | "desc") => {
      setParams({ ...params, sortBy: key || undefined, sortOrder: key ? dir : undefined });
      if (currentPage !== 1) {
        const next = new URLSearchParams(urlSearchParams.toString());
        next.set("queryPage", "1");
        router.push(`?${next.toString()}`, { scroll: false });
      }
    },
    [params, setParams, router, urlSearchParams, currentPage],
  );

  const handleReset = useCallback(() => {
    setParams({});
    if (currentPage !== 1) {
      const next = new URLSearchParams();
      next.set("queryPage", "1");
      router.push(`?${next.toString()}`, { scroll: false });
    }
  }, [setParams, router, currentPage]);

  const hasNoResults = properties.length === 0;
  const isSearchActive = Boolean(params?.search || params?.searchName);
  const showGlobalEmptyState = !isLoading && hasNoResults && !isSearchActive && activeTab === "live";

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 bg-brand-navy rounded-full" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t.properties.title}</h1>
              <p className="text-xs text-muted-foreground">{t.properties.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "live" && (
              <>
                <SearchInput
                  reset={handleReset}
                  setParams={setParams}
                  type={SEARCH_TYPE.PROPERTY}
                  options={SEARCH_OPTIONS}
                  setCurrentPage={(page: number | ((prev: number) => number)) =>
                    handlePageChange(typeof page === "function" ? page(currentPage) : page)
                  }
                />
                <Button onClick={() => toggleDialog("addProperty", true)} className="h-9 px-4">
                  <CirclePlus />
                  {t.properties.addProperty}
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsList className="mb-6">
          <TabsTrigger value="live">{t.properties.tabActive}</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            {t.properties.tabPending}
            {pendingList.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-red-500 text-white">
                {pendingList.length > 9 ? "9+" : pendingList.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          {showGlobalEmptyState ? (
            <EmptyTable
              buttonText={t.properties.createProperty}
              title={t.properties.emptyTitle}
              description={t.properties.emptyDesc}
              buttonOnClick={() => toggleDialog("addProperty", true)}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {isLoading && <Loading label={t.properties.loading} />}
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
                emptyMessage={
                  isSearchActive && hasNoResults ? t.properties.noResults : undefined
                }
                toggleDialog={(key: PropertyDialogType, value: boolean) =>
                  toggleDialog(key, value)
                }
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <PendingProperties />
        </TabsContent>
      </Tabs>

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
