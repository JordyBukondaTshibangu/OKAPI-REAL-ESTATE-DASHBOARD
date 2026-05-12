import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Agency, PaginatedResponse, QueryParams } from "@/types";

const AGENCIES_KEY = "agencies";

function buildParams(params: QueryParams) {
  const p: Record<string, string> = {};
  if (params.page) p.page = String(params.page);
  if (params.pageSize) p.pageSize = String(params.pageSize);
  if (params.searchName) p.name = params.searchName; // backend uses `name` for name-only filter
  if (params.search) p.search = params.search;
  if (params.sortBy) p.sortBy = params.sortBy;
  if (params.sortOrder) p.sortOrder = params.sortOrder;
  return p;
}

export function useAgencies(params: QueryParams) {
  return useQuery<PaginatedResponse<Agency>>({
    queryKey: [AGENCIES_KEY, params],
    queryFn: async () => {
      const { data: resp } = await api.get("/api/agencies", { params: buildParams(params) });
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

export function useAgency(id: string) {
  return useQuery<Agency>({
    queryKey: [AGENCIES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/api/agencies/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Agency>) => api.post("/api/agencies", body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENCIES_KEY] }),
  });
}

export function useUpdateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Agency> & { id: string }) =>
      api.put(`/api/agencies/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENCIES_KEY] }),
  });
}

export function useDeleteAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/agencies/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENCIES_KEY] }),
  });
}
