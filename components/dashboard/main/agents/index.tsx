"use client";

import { CirclePlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGE_SIZE } from "@/constants";
import { useAgents } from "@/lib/queries/agents";
import { useAgentStore } from "@/lib/stores/agents";
import { SEARCH_TYPE } from "@/types";
import AgentsTable, { AgentDialogType } from "../_common/agents-table";
import EmptyTable from "../_common/empty-table";
import SearchInput from "../_common/molecules/search-input";
import AddAgent from "./dialogs/create-agent/add-agent";
import DeleteAgentDialog from "./dialogs/delete-agent";
import PendingAgents from "./pending";
import { useTranslation } from "@/hooks/use-translation";

const SEARCH_OPTIONS = ["Name", "All Fields"];

function Agents() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const t = useTranslation();

  const {
    selectedAgent,
    dialogs,
    params,
    setSelectedAgent,
    toggleDialog,
    setParams,
  } = useAgentStore();

  const currentPage = Math.max(1, Number(urlSearchParams.get("queryPage") ?? "1"));
  const activeTab = urlSearchParams.get("tab") ?? "active";

  // Fetch pending count for the badge
  const { data: pendingData } = useAgents({ page: 1, pageSize: 1, pending: true });
  const pendingCount = pendingData?.totalCount ?? 0;

  const queryParams = { ...params, page: currentPage, pageSize: PAGE_SIZE };
  const { data, isLoading } = useAgents(queryParams);

  const agents = Array.isArray(data?.data) ? data.data : [];
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

  const hasNoResults = agents.length === 0;
  const isSearchActive = Boolean(params?.search || params?.searchName);
  const showGlobalEmptyState =
    !isLoading && hasNoResults && !isSearchActive && activeTab === "active";

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 bg-brand-blue rounded-full" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t.agents.title}</h1>
              <p className="text-xs text-muted-foreground">{t.agents.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "active" && (
              <>
                <SearchInput
                  reset={handleReset}
                  setParams={setParams}
                  type={SEARCH_TYPE.AGENT}
                  options={SEARCH_OPTIONS}
                  setCurrentPage={(page: number | ((prev: number) => number)) =>
                    handlePageChange(typeof page === "function" ? page(currentPage) : page)
                  }
                />
                <Button onClick={() => toggleDialog("addAgent", true)} className="h-9 px-4">
                  <CirclePlus />
                  {t.agents.addAgent}
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsList className="mb-6">
          <TabsTrigger value="active">{t.agents.tabActive}</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            {t.agents.tabPending}
            {pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-red-500 text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {showGlobalEmptyState ? (
            <EmptyTable
              buttonText={t.agents.createAgent}
              title={t.agents.emptyTitle}
              description={t.agents.emptyDesc}
              buttonOnClick={() => toggleDialog("addAgent", true)}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {isLoading && <Loading label={t.agents.loading} />}
              <AgentsTable
                agents={agents}
                totalPages={totalPages}
                totalCount={totalCount}
                currentPage={currentPage}
                searchParams={params}
                selectedAgent={selectedAgent}
                onPageChange={handlePageChange}
                onSortChange={handleSortingChange}
                setSelectedAgency={setSelectedAgent}
                emptyMessage={
                  isSearchActive && hasNoResults ? t.agents.noResults : undefined
                }
                toggleDialog={(key: AgentDialogType, value: boolean) =>
                  toggleDialog(key, value)
                }
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <PendingAgents />
        </TabsContent>
      </Tabs>

      <DeleteAgentDialog
        agent={selectedAgent!}
        currentPage={currentPage}
        open={dialogs.deleteAgent}
        setOpen={(v) => toggleDialog("deleteAgent", v)}
        onClose={() => toggleDialog("deleteAgent", false)}
      />

      <AddAgent
        open={dialogs.addAgent}
        resetCurrentPage={() => handlePageChange(1)}
        setToggle={(v: boolean) => toggleDialog("addAgent", v)}
      />
    </>
  );
}

export default Agents;
