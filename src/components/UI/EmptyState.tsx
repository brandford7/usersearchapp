import React from "react";
import { FileText, type LucideIcon, } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FileText,
  title = "No results found",
  description = "Try adjusting your search criteria",
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto text-gray-300 mb-4" size={64} />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
}
