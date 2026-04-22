// src/components/UI/SearchForm.tsx
import React from "react";
import { Search, Eraser, CreditCard } from "lucide-react";
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

  // Format SSN as user types (XXX-XX-XXXX)
  const formatSSN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as XXX-XX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    }
  };

  const handleSSNChange = (value: string) => {
    const formatted = formatSSN(value);
    handleChange("ssn", formatted);
  };

  return (
    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg">
      <form onSubmit={onSearch}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <InputField
            label="First Name *"
            value={inputs.firstName || ""}
            onChange={(v) => handleChange("firstName", v)}
            placeholder="First name"
          />
          <InputField
            label="Middle Name"
            value={inputs.middleName || ""}
            onChange={(v) => handleChange("middleName", v)}
            placeholder="Middle name"
          />
          <InputField
            label="Last Name *"
            value={inputs.lastName || ""}
            onChange={(v) => handleChange("lastName", v)}
            placeholder="Last name"
          />

          {/* SSN Field with special formatting */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              SSN
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={inputs.ssn || ""}
                onChange={(e) => handleSSNChange(e.target.value)}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg 
                         text-sm text-gray-200 placeholder-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-all font-mono"
              />
            </div>
          </div>

          <InputField
            label="DOB"
            value={inputs.dob || ""}
            onChange={(v) => handleChange("dob", v)}
            placeholder="YYYY-MM-DD"
          />
          <InputField
            label="City"
            value={inputs.city || ""}
            onChange={(v) => handleChange("city", v)}
            placeholder="City"
          />
          <InputField
            label="State"
            value={inputs.state || ""}
            onChange={(v) => handleChange("state", v.toUpperCase())}
            placeholder="CA"
          />
          <InputField
            label="ZIP"
            value={inputs.zip || ""}
            onChange={(v) => handleChange("zip", v)}
            placeholder="ZIP code"
          />
          <InputField
            label="Email"
            value={inputs.email || ""}
            onChange={(v) => handleChange("email", v)}
            placeholder="Email address"
          />
          <InputField
            label="Phone Number"
            value={inputs.phone || ""}
            onChange={(v) => handleChange("phone", v)}
            placeholder="Phone"
          />
        </div>

        {/* Helper Text */}
        <div className="mb-4 text-xs text-gray-500">
          <p>
            💡 Tip: SSN can be partial (e.g., "123-45" or "6789"). Enter any
            combination of fields to search.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 text-white bg-blue-700 hover:bg-indigo-500 border border-indigo-700 
                       py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            title="Reset button"
            type="button"
            onClick={onReset}
            className="w-12 flex items-center justify-center bg-gray-800 hover:bg-gray-700 
                       border border-gray-700 rounded-lg text-gray-400 transition-colors"
          >
            <Eraser className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </form>
    </div>
  );
}
