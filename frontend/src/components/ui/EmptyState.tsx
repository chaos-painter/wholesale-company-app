import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  message = "Ничего не найдено",
  actionLabel,
  actionTo,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3.5 py-20 px-6 text-center text-gray-400">
      {icon || <PackageOpen className="w-12 h-12 opacity-25" />}
      <p>{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                     bg-[#1a1a1a] text-bg font-semibold text-sm
                     hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
