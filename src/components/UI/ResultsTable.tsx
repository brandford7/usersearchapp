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

// Fixed pipe copy format
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
    if (!text || text === "-") return;
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
    className={`group flex items-center gap-1 text-left w-full transition-colors ${
      mono ? "font-mono" : ""
    } ${className}`}
  >
    <span
      className={`text-xs leading-tight ${
        isCopied ? "text-green-400" : "text-slate-200"
      }`}
    >
      {value || "-"}
    </span>
    {isCopied ? (
      <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
    ) : (
      <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
    )}
  </button>
);

const columns = [
  "First",
  "Last",
  "Mid",
  "Address",
  "City",
  "ST",
  "ZIP",
  "Phone",
  "DOB",
  "SSN",
  "Actions",
];

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
      <div className="w-full h-48 flex flex-col items-center justify-center text-slate-400 bg-[#0f172a] rounded-lg border border-slate-800">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-3"></div>
        <p className="text-xs font-medium">Searching database...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-slate-500 text-xs bg-[#0f172a] rounded-lg border border-slate-800">
        No results found.
      </div>
    );
  }

  const allSelected = selectedIds.size === data.length && data.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="space-y-2">
      {/* Selection Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-indigo-900/20 border border-indigo-700/50 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-indigo-300">
              {selectedIds.size} row{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySelectedSSNs}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                copiedSSNs
                  ? "bg-green-700 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              {copiedSSNs ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> SSNs Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SSNs ({selectedIds.size}
                  )
                </>
              )}
            </button>

            <button
              onClick={copySelectedRows}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                copiedRows
                  ? "bg-green-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {copiedRows ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Rows Copied!
                </>
              ) : (
                <>
                  <ClipboardList className="w-3.5 h-3.5" /> Copy Rows (
                  {selectedIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-slate-800 bg-[#0f172a] shadow-xl">
        <table
          className="w-full table-fixed"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          {/* Colgroup for widths */}
          <colgroup>
            <col className="w-8" /> {/* checkbox */}
            <col className="w-[8%]" /> {/* first */}
            <col className="w-[8%]" /> {/* last */}
            <col className="w-[5%]" /> {/* mid */}
            <col className="w-[14%]" /> {/* address */}
            <col className="w-[8%]" /> {/* city */}
            <col className="w-[4%]" /> {/* st */}
            <col className="w-[6%]" /> {/* zip */}
            <col className="w-[9%]" /> {/* phone */}
            <col className="w-[8%]" /> {/* dob */}
            <col className="w-[10%]" /> {/* ssn */}
            <col className="w-[8%]" /> {/* actions */}
          </colgroup>

          {/* Header */}
          <thead>
            <tr className="bg-[#020617]">
              {/* Checkbox */}
              <th className="px-2 py-2 border-b border-r border-slate-700">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 cursor-pointer accent-indigo-500"
                />
              </th>

              {columns.map((col, i) => (
                <th
                  key={col}
                  className={`px-2 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-700 ${
                    i < columns.length - 1 ? "border-r border-slate-700" : ""
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((person, index) => {
              const isSelected = selectedIds.has(person.id);
              const rowKey = person.id;
              const isLast = index === data.length - 1;

              return (
                <tr
                  key={`${person.id}-${index}`}
                  onClick={() => toggleRowSelection(person.id)}
                  className={`transition-colors duration-100 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-900/30"
                      : index % 2 === 0
                        ? "bg-[#0f172a] hover:bg-slate-800/60"
                        : "bg-[#0c1526] hover:bg-slate-800/60"
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${
                      !isLast ? "border-b border-slate-800" : ""
                    } ${isSelected ? "border-l-2 border-l-indigo-500" : ""}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(person.id)}
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 cursor-pointer accent-indigo-500"
                    />
                  </td>

                  {/* First Name */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.firstname || ""}
                      cellKey={`${rowKey}-firstname`}
                      isCopied={isCopied(`${rowKey}-firstname`)}
                      onCopy={copy}
                      className="font-medium"
                    />
                  </td>

                  {/* Last Name */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.lastname || ""}
                      cellKey={`${rowKey}-lastname`}
                      isCopied={isCopied(`${rowKey}-lastname`)}
                      onCopy={copy}
                      className="font-medium"
                    />
                  </td>

                  {/* Middle */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.middlename || ""}
                      cellKey={`${rowKey}-middlename`}
                      isCopied={isCopied(`${rowKey}-middlename`)}
                      onCopy={copy}
                      className="text-slate-400"
                    />
                  </td>

                  {/* Address */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.address || ""}
                      cellKey={`${rowKey}-address`}
                      isCopied={isCopied(`${rowKey}-address`)}
                      onCopy={copy}
                    />
                  </td>

                  {/* City */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.city || ""}
                      cellKey={`${rowKey}-city`}
                      isCopied={isCopied(`${rowKey}-city`)}
                      onCopy={copy}
                    />
                  </td>

                  {/* State */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.st || ""}
                      cellKey={`${rowKey}-st`}
                      isCopied={isCopied(`${rowKey}-st`)}
                      onCopy={copy}
                    />
                  </td>

                  {/* ZIP */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.zip || ""}
                      cellKey={`${rowKey}-zip`}
                      isCopied={isCopied(`${rowKey}-zip`)}
                      onCopy={copy}
                      mono
                    />
                  </td>

                  {/* Phone */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={person.phone || ""}
                      cellKey={`${rowKey}-phone`}
                      isCopied={isCopied(`${rowKey}-phone`)}
                      onCopy={copy}
                      mono
                    />
                  </td>

                  {/* DOB */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
                    <CopyableCell
                      value={formatDob(person.dob)}
                      cellKey={`${rowKey}-dob`}
                      isCopied={isCopied(`${rowKey}-dob`)}
                      onCopy={copy}
                      mono
                    />
                  </td>

                  {/* SSN */}
                  <td
                    className={`px-2 py-1.5 border-r border-slate-700/60 ${!isLast ? "border-b border-slate-800" : ""}`}
                  >
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

                  {/* Actions */}
                  <td
                    className={`px-2 py-1.5 ${!isLast ? "border-b border-slate-800" : ""}`}
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
        <div className="bg-[#020617] px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
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
