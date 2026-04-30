import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../hooks/useOrders";
import { useUsers } from "../../hooks/useUsers";
import Select from "../ui/Select";
import ErrorBanner from "../ui/ErrorBanner";
import EmptyState from "../ui/EmptyState";
import {
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
} from "../../shared/constants/status";
import type { OrderStatus } from "../../shared/constants/status";
import { ChevronDown } from "lucide-react";

export default function OrdersTab() {
  const { orders, loading, error, loadOrders, updateStatus } = useOrders();
  const { users, loadUsers } = useUsers();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState<number | "">("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
    loadUsers();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await updateStatus(orderId, newStatus);
    } catch {
      // error handled in hook
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getUserEmail = (userId: number | null) => {
    if (!userId) return "—";
    const user = users.find((u) => u.id === userId);
    return user?.email ?? `Пользователь #${userId}`;
  };

  const getTotalItems = (items: any[]) =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  const filteredOrders = userFilter
    ? orders.filter((o) => o.order.user_id === userFilter)
    : orders;

  if (loading)
    return (
      <div className="py-16 text-center text-gray-400">Загрузка заказов...</div>
    );

  return (
    <div>
      <div className="flex items-end gap-4 mb-7 flex-wrap">
        <Select
          label="Фильтр по пользователю"
          value={userFilter}
          onChange={(e) =>
            setUserFilter(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Все пользователи</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </Select>
        <span className="text-sm text-gray-400 self-end mb-1">
          {filteredOrders.length} заказов
        </span>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {filteredOrders.length === 0 ? (
        <EmptyState message="Заказов не найдено" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredOrders.map(({ order, items }) => (
            <div
              key={order.id}
              className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
                className="w-full flex items-center justify-between p-4.5 px-5 hover:bg-[#d0d0d0] transition-colors text-left"
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
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[13px] text-gray-400">
                      {getUserEmail(order.user_id)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(order.id, e.target.value);
                    }}
                    disabled={updatingStatus === order.id}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-[20px] border focus:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait ${ORDER_STATUS[order.status as OrderStatus]?.color ?? ""}`}
                  >
                    {ORDER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS[s].label}
                      </option>
                    ))}
                  </select>
                  <span className="font-bold text-base text-[#1a1a1a]">
                    {order.total_amount
                      ? `${parseFloat(order.total_amount).toFixed(2)} ₸`
                      : "—"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {expandedOrder === order.id && (
                <div className="border-t border-gray-200">
                  {items.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-2.5 bg-[#c5c5c5] text-xs font-bold text-gray-400 uppercase tracking-[0.5px]">
                        <span>Товар</span>
                        <span>Код</span>
                        <span>Кол-во</span>
                        <span className="text-right">Сумма</span>
                      </div>
                      {items.map((item, index) => (
                        <div
                          key={item.id ?? index}
                          className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-gray-200 last:border-b-0 text-sm"
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
                  <Link
                    to={`/orders/${order.id}`}
                    className="block px-5 py-3 text-sm text-[#1a1a1a] font-medium hover:bg-[#d0d0d0] transition-colors border-t border-gray-200"
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
