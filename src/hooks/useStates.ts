import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { peopleApi } from "@/api/peopleApi";
import type { ApiError } from "@/types/api";

export function useStates(
  options?: Omit<UseQueryOptions<string[], ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery<string[], ApiError>({
    queryKey: ["states"],
    queryFn: peopleApi.getStates,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
