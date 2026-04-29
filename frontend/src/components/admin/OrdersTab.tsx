import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOrders, getOrder } from "../../api/orders";
import { getInventoryItem } from "../../api/inventory";
import type { Order, OrderItem, InventoryItem } from "../../types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[rgba(245,158,11,0.1)] text-[#b45309]",
  confirmed: "bg-[rgba(59,130,246,0.1)] text-[#1d4ed8]",
  shipped: "bg-[rgba(139,92,246,0.1)] text-[#6d28d9]",
  delivered: "bg-[rgba(16,185,129,0.1)] text-[#059669]",
  cancelled: "bg-[rgba(239,68,68,0.08)] text-[#dc2626]",
};

type OrderWithDetails = {
  order: Order;
  items: (OrderItem & { product?: InventoryItem })[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const orderList = await listOrders();

      // Fetch details for each order to get items with product info
      const ordersWithItems = await Promise.all(
        orderList.map(async (order) => {
          try {
            const [orderData, items] = await getOrder(order.id);

            // Fetch product details for each item
            const itemsWithProducts = await Promise.all(
              items.map(async (item) => {
                try {
                  const product = await getInventoryItem(item.inventory_id);
                  return { ...item, product };
                } catch {
                  return item;
                }
              }),
            );

            return { order: orderData, items: itemsWithProducts };
          } catch {
            return { order, items: [] };
          }
        }),
      );

      setOrders(ordersWithItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading)
    return (
      <div className="py-16 text-center text-gray-400">Загрузка заказов...</div>
    );

  return (
    <div className="max-w-190">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#1a1a1a]">Мои заказы</h2>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-[13px]
                     hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
        >
          Новый заказ
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="py-2.5 px-3.5 mb-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[#dc2626] text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 py-20 px-6 text-center text-gray-400">
          <svg
            width="48"
            height="48"
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p>Заказов пока нет</p>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                       bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm
                       hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="flex flex-col gap-2.5">
          {orders.map(({ order, items }) => (
            <div
              key={order.id}
              className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Order Header */}
              <button
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
                className="w-full flex items-center justify-between p-4.5 px-5 
                           hover:bg-[#d0d0d0] transition-colors text-left"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1a1a1a] text-[15px]">
                      Заказ #{order.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({getTotalItems(items)} поз.)
                    </span>
                  </div>
                  <span className="text-[13px] text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-[20px] ${
                      STATUS_COLORS[order.status] ?? ""
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="font-bold text-base text-[#1a1a1a]">
                    {order.total_amount
                      ? `${parseFloat(order.total_amount).toFixed(2)} ₸`
                      : "—"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedOrder === order.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Order Items (Expandable) */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-200">
                  {items.length > 0 ? (
                    <div>
                      <div
                        className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-2.5 
                                    bg-[#c5c5c5] text-xs font-bold text-gray-400 uppercase tracking-[0.5px]"
                      >
                        <span>Товар</span>
                        <span>Код</span>
                        <span>Кол-во</span>
                        <span className="text-right">Сумма</span>
                      </div>
                      {items.map((item, index) => (
                        <div
                          key={item.id ?? index}
                          className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-2.5 
                                     border-b border-gray-200 last:border-b-0 text-sm"
                        >
                          <span className="text-[#1a1a1a] truncate">
                            {item.product?.item_name ??
                              `Товар #${item.inventory_id}`}
                          </span>
                          <span className="text-gray-400 truncate text-xs">
                            {item.product?.sku ?? "—"}
                          </span>
                          <span className="text-[#1a1a1a]">
                            {item.quantity} шт.
                          </span>
                          <span className="text-[#1a1a1a] text-right font-medium">
                            {(
                              parseFloat(item.price_at_purchase) * item.quantity
                            ).toFixed(2)}{" "}
                            ₸
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-4 text-sm text-gray-400">
                      Нет товаров в заказе
                    </div>
                  )}

                  {/* View Details Link */}
                  <Link
                    to={`/orders/${order.id}`}
                    className="block px-5 py-3 text-sm text-[#1a1a1a] font-medium 
                               hover:bg-[#d0d0d0] transition-colors border-t border-gray-200"
                  >
                    Подробнее о заказе →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
