import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const REPORTS_KEY = "reports";

export type ReportProperty = {
  id: string;
  title: string;
  suburb: string | null;
  status: string;
  isPublished: boolean;
  agent: { id: string; name: string } | null;
};

export type GroupedReport = {
  property: ReportProperty;
  count: number;
  reasons: Record<string, number>;
  reportIds: string[];
  isAutoHidden: boolean;
};

export type ResolveAction = "dismiss" | "warn_agent" | "delete_listing";

export function useGroupedReports() {
  return useQuery<GroupedReport[]>({
    queryKey: [REPORTS_KEY, "grouped"],
    queryFn: async () => {
      const { data } = await api.get("/api/reports");
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      action,
      adminId,
    }: {
      reportId: string;
      action: ResolveAction;
      adminId: string;
    }) =>
      api
        .patch(`/api/reports/${reportId}/resolve`, { action, adminId })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REPORTS_KEY] }),
  });
}
