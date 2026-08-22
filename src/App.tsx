// src/App.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { ApiResponse, SearchFilters } from "./types";
import SearchForm from "./components/UI/SearchForm";
import Pagination from "./components/Pagination";
import ResultsTable from "./components/UI/ResultsTable";
import { useAuth } from "./contexts/AuthContext";
import AdminPanel from "./components/AdminPanel";
import Header from "./components/Header";
import api from "./api/axios";

// --- HELPERS FOR URL PERSISTENCE ---
const getInitialStateFromURL = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return null;

  return {
    filters: {
      firstName: params.get("firstName") || "",
      middleName: params.get("middleName") || "",
      lastName: params.get("lastName") || "",
      ssn: params.get("ssn") || "",
      dob: params.get("dob") || "",
      city: params.get("city") || "",
      state: params.get("state") || "",
      zip: params.get("zip") || "",
      email: params.get("email") || "",
      phone: params.get("phone") || "",
    },
    cursor: params.get("cursor") || undefined,
    direction:
      (params.get("direction") as "next" | "prev" | null) || undefined,
  };
};

const updateURL = (
  filters: SearchFilters | null,
  cursor: string | undefined,
  direction: "next" | "prev" | undefined,
) => {
  if (!filters) {
    window.history.pushState({}, "", window.location.pathname);
    return;
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  if (cursor) {
    params.set("cursor", cursor);
    params.set("direction", direction ?? "next");
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};

// --- API FUNCTION ---
const fetchResults = async (
  filters: SearchFilters | null,
  cursor?: string,
  direction?: "next" | "prev",
): Promise<ApiResponse | null> => {
  if (!filters) return null;

  const params = new URLSearchParams();
  if (filters.firstName) params.append("firstname", filters.firstName);
  if (filters.middleName) params.append("middlename", filters.middleName);
  if (filters.lastName) params.append("lastname", filters.lastName);
  if (filters.ssn) params.append("ssn", filters.ssn); // Add SSN
  if (filters.dob) params.append("dob", filters.dob);
  if (filters.city) params.append("city", filters.city);
  if (filters.state) params.append("st", filters.state);
  if (filters.zip) params.append("zip", filters.zip);
  if (filters.email) params.append("email", filters.email);
  if (filters.phone) params.append("phone", filters.phone);

  params.append("limit", "100");
  if (cursor) {
    params.append("cursor", cursor);
    params.append("direction", direction ?? "next");
  }

  const response = await api.get("/people/search", { params });
  const raw = response.data;
  return {
    ...raw,
    // backend field is `phone1` (matches the DB column); map it to the
    // `phone` field the UI has always rendered.
    data: (raw?.data ?? []).map(
      (p: Record<string, unknown> & { phone1?: string }) => ({
        ...p,
        phone: p.phone1,
      }),
    ),
  };
};

export default function PeopleSearch() {
  const { isAdmin } = useAuth();

  const initialFormState: SearchFilters = {
    firstName: "",
    middleName: "",
    lastName: "",
    ssn: "",
    dob: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: "",
  };

  const urlState = getInitialStateFromURL();
  const [inputs, setInputs] = useState<SearchFilters>(
    urlState ? urlState.filters : initialFormState,
  );
  const [searchParams, setSearchParams] = useState<SearchFilters | null>(
    urlState ? urlState.filters : null,
  );
  const [cursor, setCursor] = useState<string | undefined>(
    urlState?.cursor,
  );
  const [direction, setDirection] = useState<"next" | "prev" | undefined>(
    urlState?.direction,
  );
  // Cosmetic step counter only — actual pagination is driven by `cursor`.
  const [pageIndex, setPageIndex] = useState(1);
  // total/totalPages are only sent back on the first page; cache them
  // client-side so "Showing X results" survives Next/Previous clicks.
  const [cachedTotal, setCachedTotal] = useState<number | null>(null);
  const [cachedTotalPages, setCachedTotalPages] = useState<number | null>(
    null,
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", searchParams, cursor, direction],
    queryFn: () => fetchResults(searchParams, cursor, direction),
    enabled: !!searchParams,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Adjust cached state during render (React's recommended pattern for this,
  // vs. a useEffect+setState which would cause an extra cascading render).
  if (data?.total != null && data.total !== cachedTotal) {
    setCachedTotal(data.total);
  }
  if (data?.totalPages != null && data.totalPages !== cachedTotalPages) {
    setCachedTotalPages(data.totalPages);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFilters = { ...inputs };
    setCursor(undefined);
    setDirection(undefined);
    setPageIndex(1);
    setCachedTotal(null);
    setCachedTotalPages(null);
    setSearchParams(cleanFilters);
    updateURL(cleanFilters, undefined, undefined);
  };

  const handleReset = () => {
    setInputs(initialFormState);
    setSearchParams(null);
    setCursor(undefined);
    setDirection(undefined);
    setPageIndex(1);
    setCachedTotal(null);
    setCachedTotalPages(null);
    updateURL(null, undefined, undefined);
  };

  const handleNext = () => {
    if (!data?.nextCursor) return;
    setCursor(data.nextCursor);
    setDirection("next");
    setPageIndex((n) => n + 1);
  };

  const handlePrev = () => {
    if (!data?.prevCursor) return;
    setCursor(data.prevCursor);
    setDirection("prev");
    setPageIndex((n) => Math.max(1, n - 1));
  };

  useEffect(() => {
    if (searchParams) updateURL(searchParams, cursor, direction);
  }, [cursor, direction, searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />
        {isAdmin && <AdminPanel />}

        <SearchForm
          inputs={inputs}
          setInputs={setInputs}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
            <strong>Error:</strong>{" "}
            {axios.isAxiosError(error)
              ? error.message
              : "Something went wrong."}
          </div>
        )}

        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg">
          <Pagination
            currentPage={pageIndex}
            totalItems={cachedTotal ?? data?.total ?? 0}
            totalPages={cachedTotalPages ?? data?.totalPages ?? null}
            hasMore={data?.hasMore ?? false}
            hasPrevious={data?.hasPrevious ?? false}
            isLoading={isLoading}
            onNext={handleNext}
            onPrev={handlePrev}
          />
          <ResultsTable data={data?.data ?? []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
