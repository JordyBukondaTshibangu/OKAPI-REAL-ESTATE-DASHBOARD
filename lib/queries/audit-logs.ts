import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AuditLog, AuditLogParams } from "@/types";

const AUDIT_LOGS_KEY = "audit-logs";

type AuditLogResponse = {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
};

export function useAuditLogs(params: AuditLogParams) {
  return useQuery<AuditLogResponse>({
    queryKey: [AUDIT_LOGS_KEY, params],
    queryFn: async () => {
      const p: Record<string, string> = {};
      if (params.page) p.page = String(params.page);
      if (params.limit) p.limit = String(params.limit);
      if (params.dateFrom) p.dateFrom = params.dateFrom;
      if (params.dateTo) p.dateTo = params.dateTo;
      if (params.search) p.search = params.search;

      const { data } = await api.get("/api/audit-logs", { params: p });
      return data;
    },
  });
}
