import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../api/orders';
import type { Order } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Загрузка заказов...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Мои заказы</h2>
        <Link to="/catalog" className="btn-primary btn-sm">Новый заказ</Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {orders.length === 0 ? (
        <div className="page-empty">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} opacity={0.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>Заказов пока нет</p>
          <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
              <div className="order-card-left">
                <span className="order-number">Заказ #{order.id}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="order-card-right">
                <span className={`status-badge status-${order.status}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <span className="order-total">
                  {order.total_amount ? `${parseFloat(order.total_amount).toFixed(2)} ₽` : '—'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
