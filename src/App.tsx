import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import axios from "axios"; // <--- 1. Import Axios
import type { Person, SearchFilters } from "./types";
import SearchForm from "./components/UI/SearchForm";
import Pagination from "./components/Pagination";
import ResultsTable from "./components/UI/ResultsTable";

// Components

// --- AXIOS API FUNCTION ---
const fetchResults = async (
  filters: SearchFilters | null,
  page = 1,
): Promise<Person[]> => {
  if (!filters) return [];

  // 1. Prepare Params
  const params = new URLSearchParams();

  if (filters.firstName) params.append("firstname", filters.firstName);
  if (filters.middleName) params.append("middlename", filters.middleName);
  if (filters.lastName) params.append("lastname", filters.lastName);
  if (filters.zip) params.append("zip", filters.zip);
  if (filters.city) params.append("city", filters.city);
  if (filters.state) params.append("state", filters.state);
  if (filters.dob) params.append("dob", filters.dob);
  if (filters.email) params.append("email", filters.email);
  if (filters.phone) params.append("phone", filters.phone);

  params.append("page", page.toString());
  params.append("limit", "100");

  // 2. Make Request with Axios
  // Note: Axios throws an error automatically if status is not 200-299
  const response = await axios.get(
    "https://usersearchapp.onrender.com/people/search",
    {
      params: params,
    },
  );

  console.log("Axios Response:", response.data); // Debugging

  // 3. Unwrap Data (Fix for "map is not a function")
  // Axios puts the server body inside `response.data`.
  // If your server ALSO returns an object like { data: [...] }, we need to go one level deeper.
  const serverBody = response.data;

  if (Array.isArray(serverBody)) {
    return serverBody;
  } else if (serverBody.data && Array.isArray(serverBody.data)) {
    return serverBody.data;
  } else if (serverBody.items && Array.isArray(serverBody.items)) {
    return serverBody.items;
  }

  return [];
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

  const [inputs, setInputs] = useState<SearchFilters>(initialFormState);
  const [searchParams, setSearchParams] = useState<SearchFilters | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<Person[]>({
    queryKey: ["search", searchParams, page],
    queryFn: () => fetchResults(searchParams, page),
    enabled: !!searchParams,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // --- HANDLERS ---
  const handleSearch = (e: React.FormEvent) => {
    // This line prevents the page reload / new page opening
    e.preventDefault();

    setPage(1);
    setSearchParams(inputs);
  };

  const handleReset = () => {
    setInputs(initialFormState);
    setSearchParams(null);
    setPage(1);
  };

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
            totalItems={data ? data.length : 0}
            isLoading={isLoading}
          />

          <ResultsTable data={data} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
