// components/ui/CopyButton.tsx
import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  data: any;
}

const formatDob = (dob: string | null | undefined): string => {
  if (!dob) return "";
  // YYYY-MM-DD → MM/DD/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const [year, month, day] = dob.split("-");
    return `${month}/${day}/${year}`;
  }
  // YYYYMMDD → MM/DD/YYYY
  if (/^\d{8}$/.test(dob)) {
    return `${dob.slice(4, 6)}/${dob.slice(6, 8)}/${dob.slice(0, 4)}`;
  }
  return dob;
};

export const CopyButton = ({ data }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fields = [
      data.firstname || "",
      data.lastname || "",
      data.middlename || "",
      data.address || "",
      data.city || "",
      data.st || "",
      data.zip || "",
      data.phone || "",
      formatDob(data.dob),
      data.ssn || "",
    ];

    const text = `| ${fields.join(" | ")} |`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      title="Copy this row"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};
