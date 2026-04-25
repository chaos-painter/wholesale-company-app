import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orders';

export default function CartPage() {
  const { items, remove, updateQty, clear, total } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOrder = async () => {
    setError('');
    setLoading(true);
    try {
      await createOrder(items.map(c => ({ inventory_id: c.item.id, quantity: c.quantity })));
      clear();
      navigate('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-empty">
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} opacity={0.25}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 7h12M9 21a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        <h2>Корзина пуста</h2>
        <p>Добавьте товары из каталога</p>
        <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Корзина</h2>
      {error && <div className="error-banner">{error}</div>}

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ item, quantity }) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-icon">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} opacity={0.3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                </svg>
              </div>
              <div className="cart-item-info">
                <span className="cart-item-name">{item.item_name}</span>
                {item.sku && <span className="product-sku">SKU: {item.sku}</span>}
                <span className="cart-item-price">{parseFloat(item.unit_price).toFixed(2)} ₽ / шт.</span>
              </div>
              <div className="qty-control">
                <button onClick={() => updateQty(item.id, quantity - 1)}>−</button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={item.quantity}
                  onChange={e => updateQty(item.id, Number(e.target.value))}
                />
                <button onClick={() => updateQty(item.id, quantity + 1)}>+</button>
              </div>
              <span className="cart-item-subtotal">
                {(parseFloat(item.unit_price) * quantity).toFixed(2)} ₽
              </span>
              <button className="btn-remove" onClick={() => remove(item.id)} title="Удалить">
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Итого</h3>
          <div className="summary-row">
            <span>Товаров: {items.reduce((s, c) => s + c.quantity, 0)} шт.</span>
          </div>
          <div className="summary-total">
            <span>Сумма заказа</span>
            <strong>{total.toFixed(2)} ₽</strong>
          </div>
          <button
            className="btn-primary btn-full"
            onClick={handleOrder}
            disabled={loading}
          >
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </button>
          <Link to="/catalog" className="btn-ghost btn-full">Продолжить покупки</Link>
        </div>
      </div>
    </div>
  );
}
