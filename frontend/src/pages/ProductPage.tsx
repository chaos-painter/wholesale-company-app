import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInventoryItem } from '../api/inventory';
import { listCategories } from '../api/categories';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { InventoryItem, Category } from '../types';

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
      .then(([inv, cats]) => { setItem(inv); setCategories(cats); })
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = () => {
    if (!item) return;
    add(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <div className="page-loading">Загрузка...</div>;
  if (!item) return null;

  const category = categories.find(c => c.id === item.category_id);

  return (
    <div className="product-page">
      <Link to="/catalog" className="back-link">← Назад в каталог</Link>

      <div className="product-detail-card">
        <div className="product-detail-img">
          <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} opacity={0.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
          </svg>
        </div>

        <div className="product-detail-info">
          {category && <span className="product-category">{category.category}</span>}
          <h1 className="product-detail-name">{item.item_name}</h1>
          {item.sku && <p className="product-sku">SKU: {item.sku}</p>}
          {item.description && <p className="product-detail-desc">{item.description}</p>}

          <div className="product-detail-meta">
            <div className="price-block">
              <span className="price-label">Цена за единицу</span>
              <span className="price-large">{parseFloat(item.unit_price).toFixed(2)} ₽</span>
            </div>
            <div className={`stock-badge ${item.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
              {item.quantity > 0 ? `В наличии: ${item.quantity} шт.` : 'Нет в наличии'}
            </div>
          </div>

          {token && item.quantity > 0 && (
            <div className="add-to-cart-row">
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  max={item.quantity}
                  onChange={e => setQty(Math.min(item.quantity, Math.max(1, Number(e.target.value))))}
                />
                <button onClick={() => setQty(q => Math.min(item.quantity, q + 1))}>+</button>
              </div>
              <button className={`btn-primary ${added ? 'btn-added' : ''}`} onClick={handleAdd}>
                {added ? '✓ Добавлено в корзину' : 'Добавить в корзину'}
              </button>
            </div>
          )}
          {!token && (
            <p className="auth-hint">
              <Link to="/login">Войдите</Link>, чтобы добавить товар в корзину
            </p>
          )}

          {item.cost_price && (
            <p className="cost-price-note">Себестоимость: {parseFloat(item.cost_price).toFixed(2)} ₽</p>
          )}
        </div>
      </div>
    </div>
  );
}
