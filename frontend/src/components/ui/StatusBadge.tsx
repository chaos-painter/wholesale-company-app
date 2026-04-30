import { ORDER_STATUS } from "../../shared/constants/status";
import type { OrderStatus } from "../../shared/constants/status";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "stock";
}

const STOCK_COLORS = {
  inStock: "bg-[rgba(16,185,129,0.1)] text-[#059669]",
  outOfStock: "bg-[rgba(239,68,68,0.08)] text-[#dc2626]",
};

export default function StatusBadge({
  status,
  type = "order",
}: StatusBadgeProps) {
  if (type === "stock") {
    const isInStock = status !== "out";
    return (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-[20px] ${
          isInStock ? STOCK_COLORS.inStock : STOCK_COLORS.outOfStock
        }`}
      >
        {isInStock ? `${status} шт.` : "Нет в наличии"}
      </span>
    );
  }

  const statusConfig = ORDER_STATUS[status as OrderStatus];
  if (!statusConfig) return <span>{status}</span>;

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-[20px] ${statusConfig.color}`}
    >
      {statusConfig.label}
    </span>
  );
}
