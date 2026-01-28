import React from "react";
import { Search, Eraser } from "lucide-react";
import type { SearchFilters } from "@/types";
import InputField from "./InputField";



interface SearchFormProps {
  inputs: SearchFilters;
  setInputs: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function SearchForm({
  inputs,
  setInputs,
  onSearch,
  onReset,
}: SearchFormProps) {
  // Generic handler for all inputs
  const handleChange = (field: keyof SearchFilters, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg">
      <form onSubmit={onSearch}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
          <InputField
            label="First Name *"
            value={inputs.firstName}
            onChange={(v) => handleChange("firstName", v)}
          />
          <InputField
            label="Middle Name"
            value={inputs.middleName}
            onChange={(v) => handleChange("middleName", v)}
          />
          <InputField
            label="Last Name *"
            value={inputs.lastName}
            onChange={(v) => handleChange("lastName", v)}
          />
          <InputField
            label="ZIP"
            value={inputs.zip}
            onChange={(v) => handleChange("zip", v)}
          />
          <InputField
            label="City"
            value={inputs.city}
            onChange={(v) => handleChange("city", v)}
          />
          <InputField
            label="State"
            value={inputs.state}
            onChange={(v) => handleChange("state", v)}
          />
          <InputField
            label="DOB"
            value={inputs.dob}
            onChange={(v) => handleChange("dob", v)}
          />
          <InputField
            label="Email"
            value={inputs.email}
            onChange={(v) => handleChange("email", v)}
          />
          <InputField
            label="Phone Number"
            value={inputs.phone}
            onChange={(v) => handleChange("phone", v)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 
                       py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            title="search button"
            type="button"
            onClick={onReset}
            className="w-12 flex items-center justify-center bg-gray-800 hover:bg-gray-700 
                       border border-gray-700 rounded-lg text-gray-400 transition-colors"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
