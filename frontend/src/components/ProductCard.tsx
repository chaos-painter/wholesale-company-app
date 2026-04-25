import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { InventoryItem, Category } from '../types';

interface Props {
  item: InventoryItem;
  categories: Category[];
}

export default function ProductCard({ item, categories }: Props) {
  const { add } = useCart();
  const { token } = useAuth();
  const [added, setAdded] = useState(false);
  const category = categories.find(c => c.id === item.category_id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(item, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link to={`/product/${item.id}`} className="product-card">
      <div className="product-card-img">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} opacity={0.3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
        </svg>
      </div>
      <div className="product-card-body">
        {category && <span className="product-category">{category.category}</span>}
        <h3 className="product-name">{item.item_name}</h3>
        {item.sku && <p className="product-sku">SKU: {item.sku}</p>}
        {item.description && <p className="product-desc">{item.description}</p>}
        <div className="product-footer">
          <div>
            <span className="product-price">{parseFloat(item.unit_price).toFixed(2)} ₽</span>
            <span className={`stock-badge ${item.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
              {item.quantity > 0 ? `${item.quantity} шт.` : 'Нет в наличии'}
            </span>
          </div>
          {token && item.quantity > 0 && (
            <button
              className={`btn-primary btn-sm ${added ? 'btn-added' : ''}`}
              onClick={handleAdd}
            >
              {added ? '✓ Добавлено' : '+ В корзину'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
