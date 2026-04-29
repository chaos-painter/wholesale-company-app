import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orders";

export default function CartPage() {
  const { items, remove, updateQty, clear, total } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOrder = async () => {
    setError("");
    setLoading(true);
    try {
      await createOrder(
        items.map((c) => ({ inventory_id: c.item.id, quantity: c.quantity })),
      );
      clear();
      navigate("/orders");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при оформлении заказа",
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3.5 py-20 px-6 text-center text-gray-400">
        <svg
          width="64"
          height="64"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.25}
          className="mb-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 7h12M9 21a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
        <h2 className="text-[#1a1a1a]">Корзина пуста</h2>
        <p>Добавьте товары из каталога</p>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                     bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm
                     hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-225">
      <h2 className="mb-6 text-[#1a1a1a]">Корзина</h2>

      {error && (
        <div className="p-2.5 px-3.5 mb-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-7 items-start max-md:grid-cols-1">
        {/* Cart Items */}
        <div className="flex flex-col gap-3">
          {items.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-[#dadada] border border-gray-200 rounded-lg"
            >
              {/* Item Icon */}
              <div className="w-14 h-14 shrink-0 bg-[#c5c5c5] rounded-lg flex items-center justify-center border border-gray-200">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  opacity={0.3}
                  className="text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"
                  />
                </svg>
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className="font-semibold text-[#1a1a1a] text-[15px]">
                  {item.item_name}
                </span>
                {item.sku && (
                  <span className="text-xs text-gray-400">SKU: {item.sku}</span>
                )}
                <span className="text-[13px] text-gray-400">
                  {parseFloat(item.unit_price).toFixed(2)} ₸ / шт.
                </span>
              </div>

              {/* Quantity Control */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQty(item.id, quantity - 1)}
                  className="w-9 h-9 text-lg bg-[#c5c5c5] text-[#1a1a1a] 
                             hover:bg-[#b5b5b5] transition-colors shrink-0"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={item.quantity}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  className="w-13 text-center border-x border-gray-300 h-9 text-sm font-semibold 
                             bg-[#dadada] text-[#1a1a1a] focus:outline-none"
                />
                <button
                  onClick={() => updateQty(item.id, quantity + 1)}
                  className="w-9 h-9 text-lg bg-[#c5c5c5] text-[#1a1a1a] 
                             hover:bg-[#b5b5b5] transition-colors shrink-0"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <span className="font-bold text-[#1a1a1a] min-w-20 text-right">
                {(parseFloat(item.unit_price) * quantity).toFixed(2)} ₸
              </span>

              {/* Remove Button */}
              <button
                onClick={() => remove(item.id)}
                title="Удалить"
                className="w-7 h-7 rounded-md text-xs text-gray-400 flex items-center justify-center
                           hover:bg-[rgba(239,68,68,0.08)] hover:text-danger transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          className="bg-[#dadada] border border-gray-200 rounded-lg p-6 flex flex-col gap-4 
                        sticky top-22 max-md:static"
        >
          <h3 className="text-base text-[#1a1a1a]">Итого</h3>
          <div className="text-sm text-gray-400">
            <span>
              Товаров: {items.reduce((s, c) => s + c.quantity, 0)} шт.
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-[15px]">
            <span className="text-gray-400">Сумма заказа</span>
            <strong className="text-xl text-[#1a1a1a]">
              {total.toFixed(2)} ₸
            </strong>
          </div>
          <button
            onClick={handleOrder}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                       bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm w-full
                       hover:bg-[#333] active:scale-[0.98]
                       disabled:opacity-55 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            {loading ? "Оформление..." : "Оформить заказ"}
          </button>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                       border border-gray-300 text-[#1a1a1a] font-medium text-sm w-full
                       hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                       transition-colors text-center"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
}
