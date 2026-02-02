/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import axios from "axios";
import type {  SearchFilters } from "./types";
import SearchForm from "./components/UI/SearchForm";
import Pagination from "./components/Pagination";
import ResultsTable from "./components/UI/ResultsTable";

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
      zip: params.get("zip") || "",
      city: params.get("city") || "",
      state: params.get("state") || "",
      dob: params.get("dob") || "",
      email: params.get("email") || "",
      phone: params.get("phone") || "",
    },
    page: parseInt(params.get("page") || "1", 10),
  };
};

const updateURL = (filters: SearchFilters | null, page: number) => {
  if (!filters) {
    window.history.pushState({}, "", window.location.pathname);
    return;
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  params.set("page", page.toString());
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};

// --- API FUNCTION ---
// Returns the full object so metadata isn't lost
const fetchResults = async (filters: SearchFilters | null, page = 1) => {
  if (!filters) return null;

  const params = new URLSearchParams();
  if (filters.firstName) params.append("firstname", filters.firstName);
  if (filters.middleName) params.append("middlename", filters.middleName);
  if (filters.lastName) params.append("lastname", filters.lastName);
  if (filters.state) params.append("st", filters.state);
  if (filters.city) params.append("city", filters.city);
  if (filters.zip) params.append("zip", filters.zip);
  if (filters.dob) params.append("dob", filters.dob);
  if (filters.email) params.append("email", filters.email);
  if (filters.phone) params.append("phone", filters.phone);

  params.append("page", page.toString());
  params.append("limit", "100");

  const response = await axios.get(
    "https://usersearchapp.onrender.com/people/search",
    { params },
  );
  return response.data;
};

export default function PeopleSearch() {
  const initialFormState: SearchFilters = {
    firstName: "",
    middleName: "",
    lastName: "",
    zip: "",
    city: "",
    state: "",
    dob: "",
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
  const [page, setPage] = useState(urlState ? urlState.page : 1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", searchParams, page],
    queryFn: () => fetchResults(searchParams, page),
    enabled: !!searchParams,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFilters = { ...inputs };
    setPage(1);
    setSearchParams(cleanFilters);
    updateURL(cleanFilters, 1);
  };

  const handleReset = () => {
    setInputs(initialFormState);
    setSearchParams(null);
    setPage(1);
    updateURL(null, 1);
  };

  useEffect(() => {
    if (searchParams) updateURL(searchParams, page);
  }, [page, searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xl font-semibold text-white">
          <Search className="w-5 h-5 text-indigo-500" />
          <h1>Lookup SSN</h1>
        </div>

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
            currentPage={page}
            totalItems={data?.total ?? 0}
            totalPages={data?.totalPages ?? 1}
            itemsPerPage={data?.itemsPerPage ?? 100}
            isLoading={isLoading}
            onPageChange={(newPage) => setPage(newPage)}
          />
          <ResultsTable data={data?.data ?? []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
