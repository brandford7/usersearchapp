import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { peopleApi } from "@/api/peopleApi";
import type { DatabaseStats } from "@/types/person";
import type { ApiError } from "@/types/api";

export function useStats(
  options?: Omit<
    UseQueryOptions<DatabaseStats, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<DatabaseStats, ApiError>({
    queryKey: ["stats"],
    queryFn: peopleApi.getStats,
    refetchInterval: 60000, // Refetch every minute
    ...options,
  });
}
