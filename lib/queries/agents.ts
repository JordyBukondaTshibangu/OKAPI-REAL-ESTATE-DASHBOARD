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
  if (params.pending) { p.verificationTier = "NON_VERIFIE"; p.emailVerified = "true"; }
  if (params.verificationTier) p.verificationTier = params.verificationTier;
  return p;
}

/** Returns just the count of agents awaiting admin approval. */
export function usePendingAgentsCount() {
  return useQuery<number>({
    queryKey: [AGENTS_KEY, "pending-count"],
    queryFn: async () => {
      const { data: resp } = await api.get("/api/agents", {
        params: { verificationTier: "NON_VERIFIE", emailVerified: "true", pageSize: "1", page: "1" },
      });
      return resp.meta?.total ?? resp.totalCount ?? 0;
    },
  });
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

/** Promotes a self-registered agent from NON_VERIFIE → VERIFIE. */
export function useApproveAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/agents/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}

/** Rejects (hard-deletes or marks rejected) a pending agent. */
export function useRejectAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/agents/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}

/** Suspends an agent account. */
export function useSuspendAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/api/agents/${id}/suspend`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}

/** Unsuspends an agent account. */
export function useUnsuspendAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/agents/${id}/unsuspend`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [AGENTS_KEY] }),
  });
}

/** Returns agents with profileComplete=true and idDocumentStatus=PENDING. */
export function usePendingIdentityVerification() {
  return useQuery<IdentityPendingAgent[]>({
    queryKey: [AGENTS_KEY, "pending-identity-verification"],
    queryFn: async () => {
      const { data } = await api.get("/api/agents/pending-verification");
      return Array.isArray(data) ? data : [];
    },
  });
}

export interface IdentityPendingAgent {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  photo: string | null;
  agentType: string;
  idDocumentUrl: string | null;
  selfieUrl: string | null;
  dateOfBirth: string | null;
  residenceCommune: string | null;
  communes: string[];
  createdAt: string;
  idDocumentStatus: string;
  idDocumentRejectionReason: string | null;
}

/** Approves or rejects an agent's identity document. */
export function useReviewAgentIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved, reason }: { id: string; approved: boolean; reason?: string }) =>
      api.patch(`/api/agents/${id}/review-identity`, { approved, reason }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AGENTS_KEY, "pending-identity-verification"] });
      qc.invalidateQueries({ queryKey: [AGENTS_KEY] });
    },
  });
}
