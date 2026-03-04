import { useState } from "react";
import type { Person } from "../../types";
import { CopyButton } from "./CopyButton"; // Ensure this import path is correct
import { CheckCircle } from "lucide-react";

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

export default function ResultsTable({ data, isLoading }: ResultsTableProps) {
  const [copiedSsnId, setCopiedSsnId] = useState<string | null>(null);

  const handleCopySSN = (personId: string, ssn: string) => {
    navigator.clipboard.writeText(ssn);
    setCopiedSsnId(personId);
    setTimeout(() => setCopiedSsnId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-[#0f172a] rounded-lg border border-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm font-medium">Searching database...</p>
      </div>
    );
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-slate-500 bg-[#0f172a] rounded-lg border border-slate-800">
        No results found.
      </div>
    );
  }

  return (
    // Outer Container: Dark Blue-Gray background to match image
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0f172a] shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          {/* Header: Darker background, uppercase, muted text */}
          <thead className="bg-[#020617]">
            <tr>
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

          {/* Body: Alternating colors or solid dark */}
          <tbody className="divide-y divide-slate-800 bg-[#0f172a]">
            {data.map((person, index) => {
              const isCopied = copiedSsnId === person.id;

              return (
                <tr
                  key={`${person.id}-${index}`}
                  className="hover:bg-slate-800/50 transition-colors duration-150"
                >
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

                  {/* Address Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">
                        {person.address || "N/A"}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {person.city}, {person.st} {person.zip}
                      </span>
                    </div>
                  </td>

                  {/* SSN Column - Hide SSN when copied, show only checkmark */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleCopySSN(person.id, person.ssn)}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 font-mono tracking-wide transition-all group cursor-pointer min-w-35"
                      title="Click to copy SSN"
                    >
                      {isCopied ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-medium">Copied!</span>
                        </div>
                      ) : (
                        <>
                          <span>{person.ssn}</span>
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

      {/* Footer / Pagination info area (Optional, matches bottom of image table) */}
      <div className="bg-[#020617] px-6 py-3 border-t border-slate-800 text-xs text-slate-500">
        Showing {data.length} results
      </div>
    </div>
  );
}
