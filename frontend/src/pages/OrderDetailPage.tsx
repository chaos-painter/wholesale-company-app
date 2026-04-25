import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, deleteOrder } from '../api/orders';
import { listInventory } from '../api/inventory';
import { useAuth } from '../context/AuthContext';
import type { Order, OrderItem, InventoryItem } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
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
      .then(([[o, oi], inv]) => {
        setOrder(o);
        setItems(oi);
        setInventory(inv);
      })
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!order || !confirm('Удалить заказ?')) return;
    setDeleting(true);
    try {
      await deleteOrder(order.id);
      navigate('/orders');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <div className="page-loading">Загрузка...</div>;
  if (!order) return null;

  return (
    <div className="order-detail-page">
      <Link to="/orders" className="back-link">← К списку заказов</Link>

      <div className="order-detail-header">
        <div>
          <h2>Заказ #{order.id}</h2>
          <span className="order-date">
            {new Date(order.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <div className="order-detail-actions">
          <span className={`status-badge status-${order.status}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {(isManager || order.status === 'pending') && (
            <button
              className="btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Удаление...' : 'Удалить заказ'}
            </button>
          )}
        </div>
      </div>

      <div className="order-items-table">
        <div className="table-header">
          <span>Товар</span>
          <span>SKU</span>
          <span>Кол-во</span>
          <span>Цена</span>
          <span>Сумма</span>
        </div>
        {items.map(oi => {
          const inv = inventory.find(i => i.id === oi.inventory_id);
          return (
            <div key={oi.id} className="table-row">
              <span>{inv?.item_name ?? `Товар #${oi.inventory_id}`}</span>
              <span className="text-muted">{inv?.sku ?? '—'}</span>
              <span>{oi.quantity}</span>
              <span>{parseFloat(oi.price_at_purchase).toFixed(2)} ₽</span>
              <span>{(parseFloat(oi.price_at_purchase) * oi.quantity).toFixed(2)} ₽</span>
            </div>
          );
        })}
        <div className="table-footer">
          <span>Итого</span>
          <span></span>
          <span>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span>
          <span></span>
          <strong>
            {order.total_amount ? `${parseFloat(order.total_amount).toFixed(2)} ₽` : '—'}
          </strong>
        </div>
      </div>
    </div>
  );
}
