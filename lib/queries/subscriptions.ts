import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SUBS_KEY = "subscriptions";

// ── Active subscriptions types ────────────────────────────────────────────────

export type ActiveSubAgent = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  plan: "PRO" | "AGENCY";
  subscriptionEndsAt: string | null;
  agency: { id: string; name: string } | null;
  subscriptionRequests: Array<{
    id: string;
    amount: number;
    tier: string;
    periodEnd: string | null;
    paymentMethod: string;
  }>;
};

export type ActiveAgencySubscription = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  plan: "AGENCY";
  subscriptionEndsAt: string | null;
  agency: { id: string; name: string; agentCount: number; listingCount: number } | null;
  subscriptionRequests: Array<{
    id: string;
    amount: number;
    periodEnd: string | null;
    paymentMethod: string;
  }>;
};

export type PaymentHistoryEntry = {
  id: string;
  type: "SUBSCRIPTION" | "BOOST";
  tier: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  confirmedAt: string | null;
  agent: { id: string; name: string; email: string | null };
  propertyTitle: string | null;
};

export type RevenueSummary = {
  months: Array<{ month: string; subscriptions: number; boosts: number; total: number }>;
  monthlyRevenue: number;
  activeProAgents: number;
  activeAgencyAgents: number;
  activeBoosts: number;
};

export type SubscriptionAgent = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
};

export type SubscriptionRequest = {
  id: string;
  agentId: string;
  agent: SubscriptionAgent;
  tier: "PRO" | "AGENCY";
  amount: number;
  currency: string;
  paymentMethod: "ORANGE_MONEY" | "MTN_MONEY" | "AIRTEL_MONEY" | "MPESA" | "CASH";
  paymentReference: string | null;
  screenshotUrl: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED";
  rejectionReason: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
};

export function usePendingSubscriptions() {
  return useQuery<SubscriptionRequest[]>({
    queryKey: [SUBS_KEY, "pending"],
    queryFn: async () => {
      const { data } = await api.get("/api/subscriptions/pending");
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useConfirmSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subId: string) =>
      api.patch(`/api/subscriptions/${subId}/confirm`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBS_KEY] }),
  });
}

export function useRejectSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subId, reason }: { subId: string; reason: string }) =>
      api.patch(`/api/subscriptions/${subId}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBS_KEY] }),
  });
}

// ── Active subscriptions queries ──────────────────────────────────────────────

export function useActiveAgentSubscriptions(status?: string) {
  return useQuery<ActiveSubAgent[]>({
    queryKey: [SUBS_KEY, "active-agents", status ?? "all"],
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      const { data } = await api.get(`/api/subscriptions/agents${params}`);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useActiveAgencySubscriptions() {
  return useQuery<ActiveAgencySubscription[]>({
    queryKey: [SUBS_KEY, "active-agencies"],
    queryFn: async () => {
      const { data } = await api.get("/api/subscriptions/agencies");
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCombinedPaymentHistory(period?: string) {
  return useQuery<PaymentHistoryEntry[]>({
    queryKey: [SUBS_KEY, "payments", period ?? "all"],
    queryFn: async () => {
      const params = period ? `?period=${period}` : "";
      const { data } = await api.get(`/api/subscriptions/payments${params}`);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useRevenueSummary() {
  return useQuery<RevenueSummary>({
    queryKey: [SUBS_KEY, "revenue"],
    queryFn: async () => {
      const { data } = await api.get("/api/subscriptions/revenue");
      return data;
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useDowngradeAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) =>
      api.patch(`/api/subscriptions/agents/${agentId}/downgrade`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBS_KEY] }),
  });
}

export function useExtendAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, days = 30 }: { agentId: string; days?: number }) =>
      api.patch(`/api/subscriptions/agents/${agentId}/extend?days=${days}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SUBS_KEY] }),
  });
}
