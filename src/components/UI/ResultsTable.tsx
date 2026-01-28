import { ChevronDown, User } from "lucide-react";
import type { Person } from "@/types";


interface ResultsTableProps {
  data: Person[] | undefined;
  isLoading: boolean;
}

export default function ResultsTable({ data, isLoading }: ResultsTableProps) {
  // Helper: Format DOB (YYYYMMDD -> YYYY-MM-DD)
  const formatDob = (dob: string) => {
    if (!dob || dob.length !== 8)
      return <span className="text-gray-600">-</span>;
    return `${dob.substring(0, 4)}-${dob.substring(4, 6)}-${dob.substring(6, 8)}`;
  };

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden bg-gray-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-xs uppercase font-semibold text-gray-500 tracking-wider">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-6 py-3">First Name</th>
              <th className="px-6 py-3">Middle</th>
              <th className="px-6 py-3">Last Name</th>
              <th className="px-6 py-3">DOB</th>
              <th className="px-6 py-3">Current Address</th>
              <th className="px-6 py-3 text-center">SSN</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500 italic"
                >
                  Searching records...
                </td>
              </tr>
            )}

            {!isLoading && (!data || data.length === 0) && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No records found matching your criteria.
                </td>
              </tr>
            )}

            {!isLoading &&
              data &&
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="group hover:bg-gray-800/80 transition-colors duration-150"
                >
                  <td className="px-4 py-4">
                    <button className="p-1 rounded text-gray-500 hover:bg-gray-700 hover:text-indigo-400 transition-all">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                    {row.firstname}
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {row.middlename}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                    {row.lastname}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300 whitespace-nowrap">
                    {formatDob(row.dob)}
                  </td>
                  <td className="px-6 py-4 text-gray-300 min-w-[200px] max-w-sm leading-snug">
                    <div className="flex flex-col">
                      <span>{row.address}</span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {row.city}, {row.st} {row.zip}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-gray-400 whitespace-nowrap">
                    {row.ssn ? (
                      row.ssn
                    ) : (
                      <span className="opacity-30">--- -- ----</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      title="View Full Profile"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md 
                               bg-gray-800 border border-gray-700 text-xs font-medium text-gray-300 
                               hover:bg-indigo-900 hover:text-indigo-200 hover:border-indigo-700 
                               transition-all"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
