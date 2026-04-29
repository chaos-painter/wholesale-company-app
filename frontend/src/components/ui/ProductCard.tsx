import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import type { InventoryItem, Category } from "../../types";

interface Props {
  item: InventoryItem;
  categories: Category[];
}

export default function ProductCard({ item, categories }: Props) {
  const { add } = useCart();
  const { token } = useAuth();
  const [added, setAdded] = useState(false);
  const category = categories.find((c) => c.id === item.category_id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(item, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      to={`/product/${item.id}`}
      className="flex flex-col bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden
                 transition-shadow duration-200 hover:shadow-md hover:border-gray-300"
    >
      {/* Product Image */}
      <div className="h-32.5 bg-[#c5c5c5] flex items-center justify-center border-b border-gray-200">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
          opacity={0.3}
          className="text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"
          />
        </svg>
      </div>

      {/* Product Body */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        {category && (
          <span className="text-[11px] font-semibold text-[#1a1a1a] uppercase tracking-[0.5px]">
            {category.category}
          </span>
        )}
        <h3 className="text-[15px] font-semibold text-[#1a1a1a] leading-[1.3]">
          {item.item_name}
        </h3>
        {item.sku && <p className="text-xs text-[#484848]">SKU: {item.sku}</p>}
        {item.description && (
          <p className="text-[13px] text-[#484848] overflow-hidden line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-[#1a1a1a]">
              {parseFloat(item.unit_price).toFixed(2)} ₸
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-[20px] ${
                item.quantity > 0
                  ? "bg-[rgba(16,185,129,0.1)] text-[#059669]"
                  : "bg-[rgba(239,68,68,0.08)] text-[#dc2626]"
              }`}
            >
              {item.quantity > 0 ? `${item.quantity} шт.` : "Нет в наличии"}
            </span>
          </div>
          {token && item.quantity > 0 && (
            <button
              onClick={handleAdd}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg 
                         font-semibold text-[13px] transition-all duration-200
                         ${
                           added
                             ? "bg-[#059669] text-white"
                             : "bg-[#1a1a1a] text-[#e5e5e5] hover:bg-[#333]"
                         }
                         active:scale-[0.98]`}
            >
              {added ? "✓ Добавлено" : "+ В корзину"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
