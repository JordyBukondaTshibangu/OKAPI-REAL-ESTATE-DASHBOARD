import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUsersCount() {
  return useQuery<number>({
    queryKey: ["users", "count"],
    queryFn: async () => {
      const { data } = await api.get("/api/users/count");
      return typeof data?.count === "number" ? data.count : 0;
    },
  });
}
