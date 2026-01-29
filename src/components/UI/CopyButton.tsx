/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/CopyButton.tsx
import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

interface CopyButtonProps {
  data: any; // The full row object
}

export const CopyButton = ({ data }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Format the data into a readable string (or CSV style)
    const lineString = [
      data.firstname,
      data.lastname,
      data.middlename,
      data.ssn,
      data.dob,
      data.address,
      data.city,
      data.st,
      data.zip,
    ]
      .filter(Boolean)
      .join(", "); // remove nulls and join with commas

    try {
      await navigator.clipboard.writeText(lineString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
      title="Copy this row"
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <Clipboard className="h-5 w-5" />
      )}
    </button>
  );
};
