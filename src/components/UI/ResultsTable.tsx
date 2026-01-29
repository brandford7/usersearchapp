import type { Person } from "@/types";
import { CopyButton } from "./CopyButton";

export const ResultsTable = ({
  data,
  isLoading,
}: {
  data: Person[] | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) {
    <div>Loading ...</div>;
  }
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              First Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Middle Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SSN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DOB
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.map((person) => (
            <tr key={person.id} className="hover:bg-gray-50">
              {/* DATA COLUMNS */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {person.firstname}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {person.lastname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {person.middlename}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {person.ssn}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {person.address},{person.city}, {person.st}, {person.zip}
              </td>
              
             
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {person.dob}
              </td>
              {/* ACTION COLUMN */}
              <td className="px-6 py-4 whitespace-nowrap">
                <CopyButton data={person} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
