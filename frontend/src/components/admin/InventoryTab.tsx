import { useEffect, useState } from "react";
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../../api/inventory";
import { listCategories } from "../../api/categories";
import { listWarehouses } from "../../api/warehouses";
import type { InventoryItem, Category, Warehouse } from "../../types";

export default function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    item_name: "",
    sku: "",
    unit_price: "",
    cost_price: "",
    quantity: "",
    description: "",
    category_id: "",
    warehouse_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      listInventory({ limit: 100 }),
      listCategories(),
      listWarehouses(),
    ])
      .then(([inv, cats, whs]) => {
        setItems(inv);
        setCategories(cats);
        setWarehouses(whs);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({
      item_name: "",
      sku: "",
      unit_price: "",
      cost_price: "",
      quantity: "",
      description: "",
      category_id: "",
      warehouse_id: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      item_name: item.item_name,
      sku: item.sku ?? "",
      unit_price: String(item.unit_price),
      cost_price: String(item.cost_price),
      quantity: String(item.quantity),
      description: item.description ?? "",
      category_id: item.category_id ? String(item.category_id) : "",
      warehouse_id: item.warehouse_id ? String(item.warehouse_id) : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = {
        item_name: form.item_name,
        sku: form.sku || null,
        unit_price: form.unit_price,
        cost_price: form.cost_price || "0",
        quantity: Number(form.quantity) || 0,
        description: form.description || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : null,
      } as any;

      if (editingId) {
        await updateInventoryItem(editingId, data);
      } else {
        await createInventoryItem(data);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    await deleteInventoryItem(id).catch(() => {});
    load();
  };

  const inputClasses =
    "px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm placeholder:text-[#484848] focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-colors";

  return (
    <div>
      {/* Inventory Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
      >
        <h3 className="text-[#1a1a1a]">
          {editingId ? "Редактировать товар" : "Добавить товар"}
        </h3>

        {error && (
          <div className="p-2.5 px-3.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[#dc2626] text-sm">
            {error}
          </div>
        )}

        {/* Row 1: Name + SKU */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Название *
            </label>
            <input
              required
              value={form.item_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, item_name: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              SKU
            </label>
            <input
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Row 2: Price + Cost + Quantity */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Цена продажи *
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={form.unit_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, unit_price: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Себестоимость
            </label>
            <input
              type="number"
              step="0.01"
              value={form.cost_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, cost_price: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Количество
            </label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
        </div>

        {/* Row 3: Category + Warehouse */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Категория
            </label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, category_id: e.target.value }))
              }
              className={inputClasses}
            >
              <option value="">— выбрать —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Склад
            </label>
            <select
              value={form.warehouse_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, warehouse_id: e.target.value }))
              }
              className={inputClasses}
            >
              <option value="">— выбрать —</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.location_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#1a1a1a]">
            Описание
          </label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className={inputClasses}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                       bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm
                       hover:bg-[#333] active:scale-[0.98]
                       disabled:opacity-55 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            {saving
              ? "Сохранение..."
              : editingId
                ? "Сохранить изменения"
                : "Добавить товар"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg
                         border border-gray-300 text-[#1a1a1a] font-medium text-sm
                         hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                         transition-colors"
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      {/* Loading State */}
      {loading ? (
        <div className="py-16 text-center text-[#484848]">Загрузка...</div>
      ) : (
        /* Inventory Table */
        <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
          <div
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 
                          bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-[#484848] 
                          uppercase tracking-[0.5px]"
          >
            <span>Название</span>
            <span>SKU</span>
            <span>Цена</span>
            <span>Кол-во</span>
            <span>Категория</span>
            <span></span>
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 
                         border-b border-gray-200 text-sm last:border-b-0 text-[#1a1a1a]"
            >
              <span>{item.item_name}</span>
              <span className="text-[#484848]">{item.sku ?? "—"}</span>
              <span>{parseFloat(String(item.unit_price)).toFixed(2)} ₸</span>
              <span>{item.quantity}</span>
              <span>
                {categories.find((c) => c.id === item.category_id)?.category ??
                  "—"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                             border border-gray-300 text-[#1a1a1a] font-medium text-[13px]
                             hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                             transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                             bg-[rgba(239,68,68,0.08)] text-[#dc2626] 
                             border border-[rgba(239,68,68,0.2)] font-semibold text-[13px]
                             hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
