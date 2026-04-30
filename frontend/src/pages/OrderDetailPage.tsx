import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrder, deleteOrder } from "../api/orders";
import { listInventory } from "../api/inventory";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import MainLayout from "../components/layouts/MainLayout";
import type { Order, OrderItem, InventoryItem } from "../types";

const tableGrid = "grid-cols-[2fr_1fr_80px_100px_110px]";
const tableGridMobile = "max-md:grid-cols-[2fr_80px_100px]";

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

  const getItemName = (inventoryId: number) => {
    const inv = inventory.find((i) => i.id === inventoryId);
    return inv?.item_name ?? `Товар #${inventoryId}`;
  };

  const getItemSku = (inventoryId: number) => {
    return inventory.find((i) => i.id === inventoryId)?.sku ?? "—";
  };

  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <MainLayout>
        <div className="py-16 text-center text-gray-400">Загрузка...</div>
      </MainLayout>
    );
  }

  if (!order) return null;

  return (
    <MainLayout>
      <div className="max-w-190">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-400 mb-6 hover:text-[#1a1a1a] transition-colors"
        >
          ← К списку заказов
        </Link>

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
            <StatusBadge status={order.status} />
            {(isManager || order.status === "pending") && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                loading={deleting}
              >
                Удалить заказ
              </Button>
            )}
          </div>
        </div>

        <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
          <div
            className={`grid ${tableGrid} gap-3 px-5 py-3 bg-[#c5c5c5] border-b border-gray-200 
                        text-xs font-bold text-gray-400 uppercase tracking-[0.5px] ${tableGridMobile}`}
          >
            <span>Товар</span>
            <span className="max-md:hidden">SKU</span>
            <span>Кол-во</span>
            <span>Цена</span>
            <span>Сумма</span>
          </div>

          {items.map((oi) => (
            <div
              key={oi.id}
              className={`grid ${tableGrid} gap-3 px-5 py-3 border-b border-gray-200 text-sm 
                          last:border-b-0 items-center text-[#1a1a1a] ${tableGridMobile}`}
            >
              <span>{getItemName(oi.inventory_id)}</span>
              <span className="text-gray-400 max-md:hidden">
                {getItemSku(oi.inventory_id)}
              </span>
              <span>{oi.quantity}</span>
              <span>{parseFloat(oi.price_at_purchase).toFixed(2)} ₸</span>
              <span>
                {(parseFloat(oi.price_at_purchase) * oi.quantity).toFixed(2)} ₸
              </span>
            </div>
          ))}

          <div
            className={`grid ${tableGrid} gap-3 px-5 py-3 items-center border-t border-gray-200 
                        text-sm bg-[#c5c5c5] font-semibold ${tableGridMobile}`}
          >
            <span className="text-[#1a1a1a]">Итого</span>
            <span className="max-md:hidden" />
            <span className="text-[#1a1a1a]">{totalQuantity} шт.</span>
            <span />
            <strong className="text-[#1a1a1a] text-base">
              {order.total_amount
                ? `${parseFloat(order.total_amount).toFixed(2)} ₸`
                : "—"}
            </strong>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
