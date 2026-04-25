import { useEffect, useState } from 'react';
import { listInventory } from '../api/inventory';
import { listCategories } from '../api/categories';
import ProductCard from '../components/ProductCard';
import type { InventoryItem, Category } from '../types';

export default function CatalogPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    listInventory({ search: search || undefined, category_id: categoryId })
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar">
        <h3>Категории</h3>
        <ul className="category-list">
          <li>
            <button
              className={`category-btn ${!categoryId ? 'active' : ''}`}
              onClick={() => setCategoryId(undefined)}
            >
              Все товары
            </button>
          </li>
          {categories.map(c => (
            <li key={c.id}>
              <button
                className={`category-btn ${categoryId === c.id ? 'active' : ''}`}
                onClick={() => setCategoryId(c.id)}
              >
                {c.category}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="catalog-main">
        <div className="catalog-header">
          <h2>Каталог товаров</h2>
          <div className="search-box">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} opacity={0.3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
            </svg>
            <p>Товары не найдены</p>
          </div>
        ) : (
          <div className="product-grid">
            {items.map(item => (
              <ProductCard key={item.id} item={item} categories={categories} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
