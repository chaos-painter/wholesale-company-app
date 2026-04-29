import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInventoryItem } from "../api/inventory";
import { listCategories } from "../api/categories";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { InventoryItem, Category } from "../types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { add } = useCart();
  const { token } = useAuth();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getInventoryItem(Number(id)), listCategories()])
      .then(([inv, cats]) => {
        setItem(inv);
        setCategories(cats);
      })
      .catch(() => navigate("/catalog"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = () => {
    if (!item) return;
    add(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading)
    return <div className="py-16 text-center text-gray-400">Загрузка...</div>;
  if (!item) return null;

  const category = categories.find((c) => c.id === item.category_id);

  return (
    <div className="max-w-225">
      {/* Back Link */}
      <Link
        to="/catalog"
        className="inline-flex items-center gap-1 text-sm text-gray-400 mb-6 hover:text-[#1a1a1a] transition-colors"
      >
        ← Назад в каталог
      </Link>

      {/* Product Detail Card */}
      <div className="flex gap-10 bg-[#dadada] border border-gray-200 rounded-xl p-9 max-md:flex-col max-md:p-6">
        {/* Product Image */}
        <div className="w-70 shrink-0 aspect-square bg-[#c5c5c5] rounded-lg flex items-center justify-center border border-gray-200 max-md:w-full max-md:max-w-65 max-md:self-center">
          <svg
            width="80"
            height="80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.2}
            className="text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"
            />
          </svg>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-3.5">
          {category && (
            <span className="text-[11px] font-semibold text-[#1a1a1a] uppercase tracking-[0.5px]">
              {category.category}
            </span>
          )}
          <h1 className="text-[26px] leading-tight text-[#1a1a1a]">
            {item.item_name}
          </h1>
          {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
          {item.description && (
            <p className="text-sm text-gray-400 leading-[1.6]">
              {item.description}
            </p>
          )}

          {/* Price & Stock */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400">Цена за единицу</span>
              <span className="text-[30px] font-bold text-[#1a1a1a]">
                {parseFloat(item.unit_price).toFixed(2)} ₸
              </span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-[20px] ${
                item.quantity > 0
                  ? "bg-[rgba(16,185,129,0.1)] text-[#059669]"
                  : "bg-[rgba(239,68,68,0.08)] text-[#dc2626]"
              }`}
            >
              {item.quantity > 0
                ? `В наличии: ${item.quantity} шт.`
                : "Нет в наличии"}
            </span>
          </div>

          {/* Add to Cart */}
          {token && item.quantity > 0 && (
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 text-lg bg-[#c5c5c5] text-[#1a1a1a] hover:bg-[#b5b5b5] transition-colors shrink-0"
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  max={item.quantity}
                  onChange={(e) =>
                    setQty(
                      Math.min(
                        item.quantity,
                        Math.max(1, Number(e.target.value)),
                      ),
                    )
                  }
                  className="w-13 text-center border-x border-gray-300 h-9 text-sm font-semibold bg-[#dadada] text-[#1a1a1a] focus:outline-none"
                />
                <button
                  onClick={() => setQty((q) => Math.min(item.quantity, q + 1))}
                  className="w-9 h-9 text-lg bg-[#c5c5c5] text-[#1a1a1a] hover:bg-[#b5b5b5] transition-colors shrink-0"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                className={`inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg font-semibold text-sm
                           transition-all duration-200 active:scale-[0.98]
                           ${added ? "bg-[#059669] text-white" : "bg-[#1a1a1a] text-[#e5e5e5] hover:bg-[#333]"}`}
              >
                {added ? "✓ Добавлено в корзину" : "Добавить в корзину"}
              </button>
            </div>
          )}

          {/* Auth Hint */}
          {!token && (
            <p className="text-sm mt-3 text-gray-400">
              <Link
                to="/login"
                className="text-[#1a1a1a] font-semibold hover:opacity-70 transition-opacity"
              >
                Войдите
              </Link>
              , чтобы добавить товар в корзину
            </p>
          )}

          {/* Cost Price Note */}
          {item.cost_price && (
            <p className="text-xs text-gray-400 mt-2">
              Себестоимость: {parseFloat(item.cost_price).toFixed(2)} ₸
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
