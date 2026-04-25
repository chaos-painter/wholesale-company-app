import { useEffect, useState } from 'react';
import { listInventory, createInventoryItem, deleteInventoryItem } from '../api/inventory';
import { listCategories, createCategory, deleteCategory } from '../api/categories';
import { listOrders, updateOrderStatus } from '../api/orders';
import { listWarehouses } from '../api/warehouses';
import type { InventoryItem, Category, Order, Warehouse } from '../types';

type Tab = 'inventory' | 'categories' | 'orders' | 'warehouses';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает', confirmed: 'Подтверждён',
  shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён',
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('inventory');

  return (
    <div className="admin-page">
      <h2>Панель управления</h2>
      <div className="admin-tabs">
        {(['inventory', 'categories', 'orders', 'warehouses'] as Tab[]).map(t => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {{ inventory: 'Товары', categories: 'Категории', orders: 'Заказы', warehouses: 'Склады' }[t]}
          </button>
        ))}
      </div>
      <div className="admin-content">
        {tab === 'inventory' && <InventoryTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'warehouses' && <WarehousesTab />}
      </div>
    </div>
  );
}

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ item_name: '', sku: '', unit_price: '', cost_price: '', quantity: '', description: '', category_id: '', warehouse_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([listInventory({ limit: 100 }), listCategories(), listWarehouses()])
      .then(([inv, cats, whs]) => { setItems(inv); setCategories(cats); setWarehouses(whs); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createInventoryItem({
        item_name: form.item_name,
        sku: form.sku || null,
        unit_price: form.unit_price,
        cost_price: form.cost_price || '0',
        quantity: Number(form.quantity) || 0,
        description: form.description || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : null,
      } as unknown as Parameters<typeof createInventoryItem>[0]);
      setForm({ item_name: '', sku: '', unit_price: '', cost_price: '', quantity: '', description: '', category_id: '', warehouse_id: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await deleteInventoryItem(id).catch(() => {});
    load();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="admin-form">
        <h3>Добавить товар</h3>
        {error && <div className="error-banner">{error}</div>}
        <div className="form-row">
          <div className="form-group"><label>Название *</label><input required value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} /></div>
          <div className="form-group"><label>SKU</label><input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Цена продажи *</label><input required type="number" step="0.01" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))} /></div>
          <div className="form-group"><label>Себестоимость</label><input type="number" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} /></div>
          <div className="form-group"><label>Количество</label><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Категория</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">— выбрать —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Склад</label>
            <select value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))}>
              <option value="">— выбрать —</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.location_name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label>Описание</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Добавить товар'}</button>
      </form>

      {loading ? <div className="page-loading">Загрузка...</div> : (
        <div className="admin-table">
          <div className="table-header">
            <span>Название</span><span>SKU</span><span>Цена</span><span>Кол-во</span><span>Категория</span><span></span>
          </div>
          {items.map(item => (
            <div key={item.id} className="table-row">
              <span>{item.item_name}</span>
              <span className="text-muted">{item.sku ?? '—'}</span>
              <span>{parseFloat(item.unit_price).toFixed(2)} ₽</span>
              <span>{item.quantity}</span>
              <span>{categories.find(c => c.id === item.category_id)?.category ?? '—'}</span>
              <button className="btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Удалить</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => listCategories().then(setCats);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createCategory(name).catch(() => {});
    setName('');
    setSaving(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить категорию?')) return;
    await deleteCategory(id).catch(() => {});
    load();
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="admin-form inline-form">
        <h3>Добавить категорию</h3>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Название категории" required />
          </div>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? '...' : 'Добавить'}</button>
        </div>
      </form>
      <div className="admin-table">
        <div className="table-header"><span>ID</span><span>Название</span><span></span></div>
        {cats.map(c => (
          <div key={c.id} className="table-row">
            <span className="text-muted">#{c.id}</span>
            <span>{c.category}</span>
            <button className="btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => listOrders().then(setOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: string) => {
    await updateOrderStatus(id, status).catch(() => {});
    load();
  };

  if (loading) return <div className="page-loading">Загрузка...</div>;

  return (
    <div className="admin-table">
      <div className="table-header">
        <span>Заказ</span><span>Дата</span><span>Сумма</span><span>Статус</span>
      </div>
      {orders.map(o => (
        <div key={o.id} className="table-row">
          <span>#{o.id}</span>
          <span className="text-muted">{new Date(o.created_at).toLocaleDateString('ru-RU')}</span>
          <span>{o.total_amount ? `${parseFloat(o.total_amount).toFixed(2)} ₽` : '—'}</span>
          <select
            value={o.status}
            onChange={e => handleStatus(o.id, e.target.value)}
            className={`status-select status-${o.status}`}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function WarehousesTab() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listWarehouses().then(setWarehouses).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Загрузка...</div>;

  return (
    <div className="admin-table">
      <div className="table-header">
        <span>Название</span><span>Адрес</span><span>Вместимость</span>
      </div>
      {warehouses.map(w => (
        <div key={w.id} className="table-row">
          <span>{w.location_name}</span>
          <span className="text-muted">{w.address ?? '—'}</span>
          <span>{w.capacity ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
