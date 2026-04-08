// src/components/UI/ResultsTable.tsx
import { useState } from "react";
import type { Person } from "../../types";
import { CopyButton } from "./CopyButton";
import { CheckCircle, Copy, Clipboard } from "lucide-react";

interface ResultsTableProps {
  data: Person[] | undefined;
  isLoading?: boolean;
}

// --- DATE FORMATTING HELPER FUNCTION ---
const formatDob = (dob: string | null | undefined): string => {
  if (!dob) return "-";

  // Case 1: "19590113" -> "1959-01-13"
  if (/^\d{8}$/.test(dob)) {
    const year = dob.slice(0, 4);
    const month = dob.slice(4, 6);
    const day = dob.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  // Case 2: "1959" -> "1959" (Year only)
  // Case 3: Already formatted dates -> return as is
  return dob;
};

// Format person data for copying
const formatPersonForCopy = (person: Person): string => {
  return `${person.firstname || ""}\t${person.middlename || ""}\t${person.lastname || ""}\t${formatDob(person.dob)}\t${person.address || ""}, ${person.city}, ${person.st} ${person.zip}\t${person.ssn}`;
};

export default function ResultsTable({ data, isLoading }: ResultsTableProps) {
  // Track which SSN was copied by person ID
  const [copiedSsnId, setCopiedSsnId] = useState<string | null>(null);
  // Track which Address was copied by person ID
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleCopySSN = (personId: string, ssn: string) => {
    navigator.clipboard.writeText(ssn);
    setCopiedSsnId(personId);
    setTimeout(() => setCopiedSsnId(null), 2000);
  };

  const handleCopyAddress = (personId: string, person: Person) => {
    // Format the full address for copying
    const fullAddress = `${person.address || "N/A"}, ${person.city}, ${person.st} ${person.zip}`;
    navigator.clipboard.writeText(fullAddress);
    setCopiedAddressId(personId);
    setTimeout(() => setCopiedAddressId(null), 2000);
  };

  // Toggle individual row selection
  const toggleRowSelection = (personId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all rows selection
  const toggleSelectAll = () => {
    if (!data) return;

    if (selectedIds.size === data.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(data.map((person) => person.id)));
    }
  };

  // Copy selected rows
  const copySelectedRows = () => {
    if (!data || selectedIds.size === 0) return;

    const selectedPeople = data.filter((person) => selectedIds.has(person.id));

    // Create tab-separated values (TSV) format for pasting into Excel/Sheets
    const header = "First Name\tMiddle Name\tLast Name\tDOB\tAddress\tSSN";
    const rows = selectedPeople.map(formatPersonForCopy);
    const clipboardText = [header, ...rows].join("\n");

    navigator.clipboard.writeText(clipboardText);

    // Show copied message
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-[#0f172a] rounded-lg border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-medium">Searching database...</p>
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-slate-500 bg-[#0f172a] rounded-lg border border-slate-800">
        No results found.
      </div>
    );
  }

  const allSelected = selectedIds.size === data.length && data.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="space-y-4">
      {/* Selection toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-indigo-300">
              {selectedIds.size} row{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {showCopiedMessage && (
              <div className="flex items-center gap-2 text-green-400 text-sm mr-3">
                <CheckCircle className="w-4 h-4" />
                <span>Copied to clipboard!</span>
              </div>
            )}
            <button
              onClick={copySelectedRows}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Clipboard className="w-4 h-4" />
              Copy Selected Rows
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0f172a] shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            {/* Header */}
            <thead className="bg-[#020617]">
              <tr>
                {/* Select All Checkbox */}
                <th scope="col" className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  First Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Middle
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Last Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  DOB
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Current Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  SSN
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-800 bg-[#0f172a]">
              {data.map((person, index) => {
                const isSsnCopied = copiedSsnId === person.id;
                const isAddressCopied = copiedAddressId === person.id;
                const isSelected = selectedIds.has(person.id);

                return (
                  <tr
                    key={`${person.id}-${index}`}
                    className={`transition-colors duration-150 ${
                      isSelected
                        ? "bg-indigo-900/30 border-l-4 border-l-indigo-500"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(person.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>

                    {/* Name Columns */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                      {person.firstname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {person.middlename || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                      {person.lastname}
                    </td>

                    {/* DOB Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono">
                      {person.dob ? formatDob(person.dob) : "-"}
                    </td>

                    {/* Address Column - Clickable with Copy */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCopyAddress(person.id, person)}
                        className="flex items-center gap-2 hover:text-slate-200 transition-all group cursor-pointer text-left min-w-[200px]"
                        title="Click to copy address"
                      >
                        {isAddressCopied ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Copied!</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 w-full">
                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-medium text-slate-200">
                                {person.address || "N/A"}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {person.city}, {person.st} {person.zip}
                              </span>
                            </div>
                            <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 text-slate-400" />
                          </div>
                        )}
                      </button>
                    </td>

                    {/* SSN Column - Hide SSN when copied, show only checkmark */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCopySSN(person.id, person.ssn)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 font-mono tracking-wide transition-all group cursor-pointer min-w-[140px]"
                        title="Click to copy SSN"
                      >
                        {isSsnCopied ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Copied!</span>
                          </div>
                        ) : (
                          <>
                            <span>{person.ssn}</span>
                            <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CopyButton data={person} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#020617] px-6 py-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {data.length} results</span>
          {selectedIds.size > 0 && (
            <span className="text-indigo-400">{selectedIds.size} selected</span>
          )}
        </div>
      </div>
    </div>
  );
}
