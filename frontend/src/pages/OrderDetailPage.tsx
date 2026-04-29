import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrder, deleteOrder } from "../api/orders";
import { listInventory } from "../api/inventory";
import { useAuth } from "../context/AuthContext";
import type { Order, OrderItem, InventoryItem } from "../types";

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getOrder(Number(id)), listInventory({ limit: 100 })])
      .then(([o, inv]) => {
        setOrder(o[0]);
        setItems(o[1]);
        setInventory(inv);
      })
      .catch(() => navigate("/orders"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!order || !confirm("Удалить заказ?")) return;
    setDeleting(true);
    try {
      await deleteOrder(order.id);
      navigate("/orders");
    } catch {
      setDeleting(false);
    }
  };

  if (loading)
    return <div className="py-16 text-center text-gray-400">Загрузка...</div>;
  if (!order) return null;

  return (
    <div className="max-w-190">
      {/* Back Link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-400 mb-6 hover:text-[#1a1a1a] transition-colors"
      >
        ← К списку заказов
      </Link>

      {/* Order Header */}
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h2 className="mb-1 text-[#1a1a1a]">Заказ #{order.id}</h2>
          <span className="text-[13px] text-gray-400">
            {new Date(order.created_at).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-[20px] ${
              STATUS_COLORS[order.status] ?? ""
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {(isManager || order.status === "pending") && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                         bg-[rgba(239,68,68,0.08)] text-[#dc2626] 
                         border border-[rgba(239,68,68,0.2)] font-semibold text-[13px]
                         hover:bg-[rgba(239,68,68,0.15)] transition-colors
                         disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {deleting ? "Удаление..." : "Удалить заказ"}
            </button>
          )}
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div
          className="grid grid-cols-[2fr_1fr_80px_100px_110px] gap-3 px-5 py-3 
                        bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-gray-400 
                        uppercase tracking-[0.5px]
                        max-md:grid-cols-[2fr_80px_100px]"
        >
          <span>Товар</span>
          <span className="max-md:hidden">SKU</span>
          <span>Кол-во</span>
          <span>Цена</span>
          <span>Сумма</span>
        </div>

        {/* Table Rows */}
        {items.map((oi) => {
          const inv = inventory.find((i) => i.id === oi.inventory_id);
          return (
            <div
              key={oi.id}
              className="grid grid-cols-[2fr_1fr_80px_100px_110px] gap-3 px-5 py-3 
                         border-b border-gray-200 text-sm last:border-b-0 items-center text-[#1a1a1a]
                         max-md:grid-cols-[2fr_80px_100px]"
            >
              <span>{inv?.item_name ?? `Товар #${oi.inventory_id}`}</span>
              <span className="text-gray-400 max-md:hidden">
                {inv?.sku ?? "—"}
              </span>
              <span>{oi.quantity}</span>
              <span>{parseFloat(oi.price_at_purchase).toFixed(2)} ₸</span>
              <span>
                {(parseFloat(oi.price_at_purchase) * oi.quantity).toFixed(2)} ₸
              </span>
            </div>
          );
        })}

        {/* Table Footer */}
        <div
          className="grid grid-cols-[2fr_1fr_80px_100px_110px] gap-3 px-5 py-3 
                        items-center border-t border-gray-200 text-sm bg-[#c5c5c5] font-semibold
                        max-md:grid-cols-[2fr_80px_100px]"
        >
          <span className="text-[#1a1a1a]">Итого</span>
          <span className="max-md:hidden"></span>
          <span className="text-[#1a1a1a]">
            {items.reduce((s, i) => s + i.quantity, 0)} шт.
          </span>
          <span></span>
          <strong className="text-[#1a1a1a] text-base">
            {order.total_amount
              ? `${parseFloat(order.total_amount).toFixed(2)} ₸`
              : "—"}
          </strong>
        </div>
      </div>
    </div>
  );
}
