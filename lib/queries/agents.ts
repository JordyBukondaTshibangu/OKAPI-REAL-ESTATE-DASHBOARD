import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Agent, PaginatedResponse, QueryParams } from "@/types";

const AGENTS_KEY = "agents";

function buildParams(params: QueryParams) {
  const p: Record<string, string> = {};
  if (params.page) p.page = String(params.page);
  if (params.pageSize) p.pageSize = String(params.pageSize);
  if (params.searchName) p.name = params.searchName; // backend uses `name` for name-only filter
  if (params.search) p.search = params.search;
  if (params.sortBy) p.sortBy = params.sortBy;
  if (params.sortOrder) p.sortOrder = params.sortOrder;
  if (params.agencyId) p.agencyId = params.agencyId;
  return p;
}

export function useAgents(params: QueryParams) {
  return useQuery<PaginatedResponse<Agent>>({
    queryKey: [AGENTS_KEY, params],
    queryFn: async () => {
      const { data: resp } = await api.get("/api/agents", { params: buildParams(params) });
      return {
        data: Array.isArray(resp.data) ? resp.data : [],
        page: resp.meta?.page ?? resp.page ?? 1,
        pageSize: resp.meta?.limit ?? resp.pageSize ?? 10,
        totalCount: resp.meta?.total ?? resp.totalCount ?? 0,
        totalPages: resp.meta?.totalPages ?? resp.totalPages ?? 1,
      };
    },
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: [AGENTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/api/agents/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post("/api/agents", body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Agent> & { id: string }) =>
      api.patch(`/api/agents/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/agents/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}
