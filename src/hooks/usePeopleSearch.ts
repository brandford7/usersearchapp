import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { peopleApi } from "@/api/peopleApi";
import type { SearchParams, SearchResponse } from "@/types/person";
import type { ApiError } from "@/types/api";

function hasValidSearchParams(params: SearchParams): boolean {
  const { page, limit, ...searchFields } = params;
  return Object.values(searchFields).some(
    (value) => value !== "" && value !== null && value !== undefined,
  );
}

export function usePeopleSearch(
  searchParams: SearchParams,
  options?: Omit<
    UseQueryOptions<SearchResponse, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<SearchResponse, ApiError>({
    queryKey: ["people", "search", searchParams],
    queryFn: () => peopleApi.searchPeople(searchParams),
    enabled: hasValidSearchParams(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  });
}
