// src/components/UI/ResultsTable.tsx
import { useState } from "react";
import type { Person } from "../../types";
import { CopyButton } from "./CopyButton";
import { CheckCircle, Copy, ClipboardList } from "lucide-react";

interface ResultsTableProps {
  data: Person[] | undefined;
  isLoading?: boolean;
}

const formatDob = (dob: string | null | undefined): string => {
  if (!dob) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const [year, month, day] = dob.split("-");
    return `${month}/${day}/${year}`;
  }
  if (/^\d{8}$/.test(dob)) {
    const year = dob.slice(0, 4);
    const month = dob.slice(4, 6);
    const day = dob.slice(6, 8);
    return `${month}/${day}/${year}`;
  }
  return dob;
};

// Fixed: proper pipe format
// Output: | John | Sweeney | L | 246 Pinecastle Ave | Pittsburgh | PA | 15234 | 4128847146 | 10/13/1971 | 191-64-3353 |
const formatPersonForCopy = (person: Person): string => {
  const fields = [
    person.firstname || "",
    person.lastname || "",
    person.middlename || "",
    person.address || "",
    person.city || "",
    person.st || "",
    person.zip || "",
    person.phone || "",
    formatDob(person.dob),
    person.ssn || "",
  ];
  return `| ${fields.join(" | ")} |`;
};

const useCellCopy = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isCopied = (key: string) => copiedKey === key;

  return { copy, isCopied };
};

interface CopyableCellProps {
  value: string;
  cellKey: string;
  isCopied: boolean;
  onCopy: (key: string, value: string) => void;
  className?: string;
  mono?: boolean;
}

const CopyableCell = ({
  value,
  cellKey,
  isCopied,
  onCopy,
  className = "",
  mono = false,
}: CopyableCellProps) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onCopy(cellKey, value);
    }}
    title={`Click to copy: ${value}`}
    className={`group flex items-center gap-1.5 text-left w-full transition-colors ${
      mono ? "font-mono" : ""
    } ${className}`}
  >
    <span
      className={`text-sm ${isCopied ? "text-green-400" : "text-slate-200"}`}
    >
      {value || "-"}
    </span>
    {isCopied ? (
      <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
    ) : (
      <Copy className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
    )}
  </button>
);

// Column divider component
const ColDivider = () => (
  <td className="py-3 px-0 w-px">
    <div className="w-px h-5 bg-slate-700 mx-auto" />
  </td>
);

export default function ResultsTable({ data, isLoading }: ResultsTableProps) {
  const { copy, isCopied } = useCellCopy();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedRows, setCopiedRows] = useState(false);
  const [copiedSSNs, setCopiedSSNs] = useState(false);

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

  const copySelectedRows = () => {
    if (!data || selectedIds.size === 0) return;
    const selected = data.filter((p) => selectedIds.has(p.id));
    const rows = selected.map(formatPersonForCopy).join("\n");
    navigator.clipboard.writeText(rows);
    setCopiedRows(true);
    setTimeout(() => setCopiedRows(false), 2000);
  };

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

  const columns = [
    "First Name",
    "Last Name",
    "Middle",
    "Address",
    "City",
    "ST",
    "ZIP",
    "Phone",
    "DOB",
    "SSN",
    "Actions",
  ];

  return (
    <div className="space-y-3">
      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
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

          <div className="flex items-center gap-2 flex-wrap">
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
                  <CheckCircle className="w-4 h-4" /> SSNs Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy SSNs ({selectedIds.size})
                </>
              )}
            </button>

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
                  <CheckCircle className="w-4 h-4" /> Rows Copied!
                </>
              ) : (
                <>
                  <ClipboardList className="w-4 h-4" /> Copy Rows (
                  {selectedIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table - no overflow scroll, full width */}
      <div className="rounded-lg border border-slate-800 bg-[#0f172a] shadow-xl">
        <table className="w-full table-fixed divide-y divide-slate-800">
          {/* Header */}
          <thead className="bg-[#020617]">
            <tr>
              {/* Checkbox col */}
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

              {/* Divider placeholder */}
              <th className="w-px p-0" />

              {columns.map((col, i) => (
                <>
                  <th
                    key={col}
                    className="px-3 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                  {/* Divider after every column except last */}
                  {i < columns.length - 1 && (
                    <th key={`div-${col}`} className="w-px p-0" />
                  )}
                </>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-800">
            {data.map((person, index) => {
              const isSelected = selectedIds.has(person.id);
              const rowKey = person.id;

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
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(person.id)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                    />
                  </td>

                  <ColDivider />

                  {/* First Name */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.firstname || ""}
                      cellKey={`${rowKey}-firstname`}
                      isCopied={isCopied(`${rowKey}-firstname`)}
                      onCopy={copy}
                      className="font-medium"
                    />
                  </td>

                  <ColDivider />

                  {/* Last Name */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.lastname || ""}
                      cellKey={`${rowKey}-lastname`}
                      isCopied={isCopied(`${rowKey}-lastname`)}
                      onCopy={copy}
                      className="font-medium"
                    />
                  </td>

                  <ColDivider />

                  {/* Middle Name */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.middlename || ""}
                      cellKey={`${rowKey}-middlename`}
                      isCopied={isCopied(`${rowKey}-middlename`)}
                      onCopy={copy}
                      className="text-slate-400"
                    />
                  </td>

                  <ColDivider />

                  {/* Address */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.address || ""}
                      cellKey={`${rowKey}-address`}
                      isCopied={isCopied(`${rowKey}-address`)}
                      onCopy={copy}
                    />
                  </td>

                  <ColDivider />

                  {/* City */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.city || ""}
                      cellKey={`${rowKey}-city`}
                      isCopied={isCopied(`${rowKey}-city`)}
                      onCopy={copy}
                    />
                  </td>

                  <ColDivider />

                  {/* State */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.st || ""}
                      cellKey={`${rowKey}-st`}
                      isCopied={isCopied(`${rowKey}-st`)}
                      onCopy={copy}
                    />
                  </td>

                  <ColDivider />

                  {/* ZIP */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.zip || ""}
                      cellKey={`${rowKey}-zip`}
                      isCopied={isCopied(`${rowKey}-zip`)}
                      onCopy={copy}
                      mono
                    />
                  </td>

                  <ColDivider />

                  {/* Phone */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.phone || ""}
                      cellKey={`${rowKey}-phone`}
                      isCopied={isCopied(`${rowKey}-phone`)}
                      onCopy={copy}
                      mono
                    />
                  </td>

                  <ColDivider />

                  {/* DOB */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={formatDob(person.dob)}
                      cellKey={`${rowKey}-dob`}
                      isCopied={isCopied(`${rowKey}-dob`)}
                      onCopy={copy}
                      mono
                    />
                  </td>

                  <ColDivider />

                  {/* SSN */}
                  <td className="px-3 py-3">
                    <CopyableCell
                      value={person.ssn || ""}
                      cellKey={`${rowKey}-ssn`}
                      isCopied={isCopied(`${rowKey}-ssn`)}
                      onCopy={copy}
                      mono
                      className={
                        isSelected ? "text-indigo-300" : "text-slate-400"
                      }
                    />
                  </td>

                  <ColDivider />

                  {/* Actions */}
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CopyButton data={person} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

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
