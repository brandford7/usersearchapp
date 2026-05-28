// src/components/UI/ResultsTable.tsx
import { useState } from "react";
import type { Person } from "../../types";
import { CopyButton } from "./CopyButton";
import { CheckCircle, Copy, Clipboard, ClipboardList } from "lucide-react";

interface ResultsTableProps {
  data: Person[] | undefined;
  isLoading?: boolean;
}

const formatDob = (dob: string | null | undefined): string => {
  if (!dob) return "-";
  if (/^\d{8}$/.test(dob)) {
    return `${dob.slice(0, 4)}-${dob.slice(4, 6)}-${dob.slice(6, 8)}`;
  }
  return dob;
};

const formatPersonForCopy = (person: Person): string => {
  return `${person.firstname || ""}\t${person.middlename || ""}\t${person.lastname || ""}\t${formatDob(person.dob)}\t${person.address || ""}, ${person.city}, ${person.st} ${person.zip}\t${person.ssn}`;
};

export default function ResultsTable({ data, isLoading }: ResultsTableProps) {
  const [copiedSsnId, setCopiedSsnId] = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedRows, setCopiedRows] = useState(false);
  const [copiedSSNs, setCopiedSSNs] = useState(false);

  // Single row handlers
  const handleCopySSN = (personId: string, ssn: string) => {
    navigator.clipboard.writeText(ssn);
    setCopiedSsnId(personId);
    setTimeout(() => setCopiedSsnId(null), 2000);
  };

  const handleCopyAddress = (personId: string, person: Person) => {
    const fullAddress = `${person.address || "N/A"}, ${person.city}, ${person.st} ${person.zip}`;
    navigator.clipboard.writeText(fullAddress);
    setCopiedAddressId(personId);
    setTimeout(() => setCopiedAddressId(null), 2000);
  };

  // Multi-select handlers
  const toggleRowSelection = (personId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Copy selected full rows (TSV for Excel/Sheets)
  const copySelectedRows = () => {
    if (!data || selectedIds.size === 0) return;
    const selected = data.filter((p) => selectedIds.has(p.id));
    const header = "First Name\tMiddle Name\tLast Name\tDOB\tAddress\tSSN";
    const rows = selected.map(formatPersonForCopy);
    navigator.clipboard.writeText([header, ...rows].join("\n"));
    setCopiedRows(true);
    setTimeout(() => setCopiedRows(false), 2000);
  };

  // Copy selected SSNs only (one per line)
  const copySelectedSSNs = () => {
    if (!data || selectedIds.size === 0) return;
    const selected = data.filter((p) => selectedIds.has(p.id));
    const ssns = selected.map((p) => p.ssn).join("\n");
    navigator.clipboard.writeText(ssns);
    setCopiedSSNs(true);
    setTimeout(() => setCopiedSSNs(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-[#0f172a] rounded-lg border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-medium">Searching database...</p>
      </div>
    );
  }

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
    <div className="space-y-3">
      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-indigo-300">
              {selectedIds.size} row{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Right: Copy buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy SSNs only */}
            <button
              onClick={copySelectedSSNs}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                copiedSSNs
                  ? "bg-green-700 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              {copiedSSNs ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  SSNs Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy SSNs ({selectedIds.size})
                </>
              )}
            </button>

            {/* Copy full rows */}
            <button
              onClick={copySelectedRows}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                copiedRows
                  ? "bg-green-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {copiedRows ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Rows Copied!
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" />
                  Copy Full Rows ({selectedIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0f172a] shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            {/* Header */}
            <thead className="bg-[#020617]">
              <tr>
                <th scope="col" className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Middle
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  DOB
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  SSN
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-800">
              {data.map((person, index) => {
                const isSsnCopied = copiedSsnId === person.id;
                const isAddressCopied = copiedAddressId === person.id;
                const isSelected = selectedIds.has(person.id);

                return (
                  <tr
                    key={`${person.id}-${index}`}
                    onClick={() => toggleRowSelection(person.id)}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-900/30 border-l-2 border-l-indigo-500"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(person.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                      />
                    </td>

                    {/* Name Columns */}
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {person.firstname}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-slate-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {person.middlename || "-"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {person.lastname}
                    </td>

                    {/* DOB */}
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formatDob(person.dob)}
                    </td>

                    {/* Address - Click to copy */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAddress(person.id, person);
                        }}
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

                    {/* SSN - Click to copy */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySSN(person.id, person.ssn);
                        }}
                        className={`flex items-center gap-2 text-sm font-mono tracking-wide transition-all group cursor-pointer min-w-[140px] ${
                          isSelected
                            ? "text-indigo-300"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
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

                    {/* Actions */}
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
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
            <span className="text-indigo-400 font-medium">
              {selectedIds.size} of {data.length} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
