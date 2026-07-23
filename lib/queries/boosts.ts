import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const BOOSTS_KEY = "boosts";

export type BoostProperty = {
  id: string;
  title: string;
  suburb: string;
  city: string;
  category: string;
  gallery: string[];
  isBoosted: boolean;
  boostedUntil: string | null;
};

export type BoostAgent = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
};

export type BoostRequest = {
  id: string;
  propertyId: string;
  property: BoostProperty;
  agentId: string;
  agent: BoostAgent;
  durationDays: number;
  amount: number;
  currency: string;
  paymentMethod: "ORANGE_MONEY" | "MTN_MONEY" | "AIRTEL_MONEY" | "MPESA" | "CASH";
  paymentReference: string | null;
  screenshotUrl: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED";
  rejectionReason: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  createdAt: string;
};

export function usePendingBoosts() {
  return useQuery<BoostRequest[]>({
    queryKey: [BOOSTS_KEY, "pending"],
    queryFn: async () => {
      const { data } = await api.get("/api/boosts/pending");
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useConfirmBoost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boostId: string) =>
      api.patch(`/api/boosts/${boostId}/confirm`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BOOSTS_KEY] }),
  });
}

export function useRejectBoost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ boostId, reason }: { boostId: string; reason: string }) =>
      api.patch(`/api/boosts/${boostId}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BOOSTS_KEY] }),
  });
}
