import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const REVIEWS_KEY = "reviews";

export type PendingReview = {
  id: string;
  rating: number;
  ratingReactivite?: number | null;
  ratingHonnetete?: number | null;
  ratingProfessionnalisme?: number | null;
  comment?: string;
  createdAt: string;
  isVisible: boolean;
  user?: { id: string; firstName: string; lastName: string };
  agent?: { id: string; name: string };
  property?: { id: string; title: string };
};

export function usePendingReviews() {
  return useQuery<PendingReview[]>({
    queryKey: [REVIEWS_KEY, "pending"],
    queryFn: async () => {
      const { data } = await api.get("/api/reviews/pending");
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      action,
    }: {
      reviewId: string;
      action: "approve" | "reject";
    }) =>
      api
        .patch(`/api/reviews/${reviewId}/${action}`, {})
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REVIEWS_KEY] }),
  });
}
