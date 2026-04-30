import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import ErrorBanner from "../components/ui/ErrorBanner";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import MainLayout from "../components/layouts/MainLayout";
import { ChevronDown } from "lucide-react";
import type { InventoryItem } from "../types";

export default function OrdersPage() {
  const { orders, loading, error, loadOrders } = useOrders();
  const { userId } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
    import("../api/inventory").then(({ listInventory }) => {
      listInventory({ limit: 500 })
        .then(setInventory)
        .catch(() => {});
    });
  }, []);

  const getInventoryItem = (inventoryId: number) => {
    return inventory.find((i) => i.id === inventoryId);
  };

  const getTotalItems = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const userOrders = userId
    ? orders.filter((o) => o.order.user_id === userId)
    : orders;

  if (loading) {
    return (
      <MainLayout>
        <div className="py-16 text-center text-gray-400">
          Загрузка заказов...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-190">
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

        {error && <ErrorBanner message={error} className="mb-4" />}

        {userOrders.length === 0 ? (
          <EmptyState
            message="Заказов пока нет"
            actionLabel="Перейти в каталог"
            actionTo="/catalog"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {userOrders.map(({ order, items }) => (
              <div
                key={order.id}
                className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id,
                    )
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
                    <span className="text-[13px] text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold text-base text-[#1a1a1a]">
                      {order.total_amount
                        ? `${parseFloat(order.total_amount).toFixed(2)} ₸`
                        : "—"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedOrder === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200">
                    {items.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-[1fr_80px_auto_auto] gap-3 px-5 py-2.5 bg-[#c5c5c5] text-xs font-bold text-gray-400 uppercase tracking-[0.5px]">
                          <span>Товар</span>
                          <span>SKU</span>
                          <span>Кол-во</span>
                          <span className="text-right">Сумма</span>
                        </div>
                        {items.map((item) => {
                          const inv = getInventoryItem(item.inventory_id);
                          return (
                            <div
                              key={item.id}
                              className="grid grid-cols-[1fr_80px_auto_auto] gap-3 px-5 py-2.5 border-b border-gray-200 last:border-b-0 text-sm items-center"
                            >
                              <span className="text-[#1a1a1a] truncate font-medium">
                                {inv?.item_name ??
                                  `Товар #${item.inventory_id}`}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {inv?.sku ?? "—"}
                              </span>
                              <span className="text-[#1a1a1a]">
                                {item.quantity} шт.
                              </span>
                              <span className="text-[#1a1a1a] text-right font-medium">
                                {(
                                  parseFloat(item.price_at_purchase) *
                                  item.quantity
                                ).toFixed(2)}{" "}
                                ₸
                              </span>
                            </div>
                          );
                        })}
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
    </MainLayout>
  );
}
