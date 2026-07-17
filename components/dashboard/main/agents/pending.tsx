"use client";

import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Loading } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/constants";
import { useAgents } from "@/lib/queries/agents";
import { useAgentStore } from "@/lib/stores/agents";
import { useTranslation } from "@/hooks/use-translation";
import { SEARCH_TYPE } from "@/types";
import AgentsTable, { AgentDialogType } from "../_common/agents-table";
import SearchInput from "../_common/molecules/search-input";
import DeleteAgentDialog from "./dialogs/delete-agent";
import AddAgent from "./dialogs/create-agent/add-agent";

function PendingAgents() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const t = useTranslation();
  const tp = t.agents.pending;

  const {
    selectedAgent,
    dialogs,
    params,
    setSelectedAgent,
    toggleDialog,
    setParams,
  } = useAgentStore();

  const rawPage = parseInt(urlSearchParams.get("queryPage") ?? "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Always filter for pending-approval agents
  const queryParams = {
    ...params,
    page: currentPage,
    pageSize: PAGE_SIZE,
    pending: true as const,
  };

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
      router.push("?queryPage=1", { scroll: false });
    }
  }, [setParams, router, currentPage]);

  const SEARCH_OPTIONS = [...tp.searchOptions];

  return (
    <>
      <div className="flex flex-col gap-6">
        {isLoading && <Loading label={tp.loading} />}

        <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
          {totalCount !== undefined && totalCount > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">
                <AlertCircle className="w-3 h-3" />
                {totalCount}
              </span>
              {tp.subtitle}
            </p>
          )}

          <SearchInput
            reset={handleReset}
            setParams={setParams}
            type={SEARCH_TYPE.AGENT}
            options={SEARCH_OPTIONS}
            setCurrentPage={(page: number | ((prev: number) => number)) =>
              handlePageChange(typeof page === "function" ? page(currentPage) : page)
            }
          />
        </div>

        {!isLoading && agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{tp.emptyTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{tp.emptyDesc}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/agents?tab=active", { scroll: false })}
            >
              {tp.viewAll}
            </Button>
          </div>
        ) : (
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
            emptyMessage={tp.noSearchResults}
            toggleDialog={(key: AgentDialogType, value: boolean) => toggleDialog(key, value)}
          />
        )}
      </div>

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

export default PendingAgents;
