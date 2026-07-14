import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Property, PaginatedResponse, QueryParams } from "@/types";

const PROPERTIES_KEY = "properties";

function buildParams(params: QueryParams) {
  const p: Record<string, string> = {};
  if (params.page) p.page = String(params.page);
  if (params.pageSize) p.pageSize = String(params.pageSize);
  // Properties backend only has general `search`, no name-specific filter
  if (params.searchName) p.search = params.searchName;
  else if (params.search) p.search = params.search;
  if (params.sortBy) p.sortBy = params.sortBy;
  if (params.sortOrder) p.sortOrder = params.sortOrder;
  if (params.agentId) p.agentId = params.agentId;
  if (params.agencyId) p.agencyId = params.agencyId;
  return p;
}

export function useProperties(params: QueryParams) {
  return useQuery<PaginatedResponse<Property>>({
    queryKey: [PROPERTIES_KEY, params],
    queryFn: async () => {
      const { data: resp } = await api.get("/api/properties", { params: buildParams(params) });
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

export function useProperty(id: string) {
  return useQuery<Property>({
    queryKey: [PROPERTIES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/api/properties/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post("/api/properties", body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPERTIES_KEY] }),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Record<string, unknown> & { id: string }) =>
      api.patch(`/api/properties/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPERTIES_KEY] }),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/properties/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPERTIES_KEY] }),
  });
}

export function usePendingProperties() {
  return useQuery<Property[]>({
    queryKey: [PROPERTIES_KEY, "pending"],
    queryFn: async () => {
      const { data } = await api.get("/api/properties/admin/pending");
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30_000,
  });
}

export function useApproveProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/api/properties/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPERTIES_KEY] }),
  });
}

export function useRejectProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/api/properties/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPERTIES_KEY] }),
  });
}
