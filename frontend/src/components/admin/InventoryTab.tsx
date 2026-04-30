import { useEffect, useState } from "react";
import { useInventory } from "../../hooks/useInventory";
import { useCategories } from "../../hooks/useCategories";
import { useWarehouses } from "../../hooks/useWarehouses";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import ErrorBanner from "../ui/ErrorBanner";
import type { InventoryItem } from "../../types";

export default function InventoryTab() {
  const { items, loading, error, loadItems, addItem, updateItem, removeItem } =
    useInventory();
  const { categories, loadCategories } = useCategories();
  const { warehouses, loadWarehouses } = useWarehouses();
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
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadItems();
    loadCategories();
    loadWarehouses();
  }, []);

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
    setFormError("");
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
    setFormError("");
    setSaving(true);
    try {
      const data: any = {
        item_name: form.item_name,
        sku: form.sku || undefined,
        unit_price: form.unit_price,
        cost_price: form.cost_price || "0",
        quantity: Number(form.quantity) || 0,
        description: form.description || undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : undefined,
      };
      if (editingId) {
        await updateItem(editingId, data);
      } else {
        await addItem(data);
      }
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    await removeItem(id).catch(() => {});
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
      >
        <h3 className="text-[#1a1a1a]">
          {editingId ? "Редактировать товар" : "Добавить товар"}
        </h3>

        {formError && <ErrorBanner message={formError} />}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <Input
            label="Название *"
            required
            value={form.item_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, item_name: e.target.value }))
            }
          />
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <Input
            label="Цена продажи *"
            type="number"
            step="0.01"
            required
            value={form.unit_price}
            onChange={(e) =>
              setForm((f) => ({ ...f, unit_price: e.target.value }))
            }
          />
          <Input
            label="Себестоимость"
            type="number"
            step="0.01"
            value={form.cost_price}
            onChange={(e) =>
              setForm((f) => ({ ...f, cost_price: e.target.value }))
            }
          />
          <Input
            label="Количество"
            type="number"
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <Select
            label="Категория"
            value={form.category_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, category_id: e.target.value }))
            }
          >
            <option value="">— выбрать —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category}
              </option>
            ))}
          </Select>
          <Select
            label="Склад"
            value={form.warehouse_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, warehouse_id: e.target.value }))
            }
          >
            <option value="">— выбрать —</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.location_name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Описание"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} loading={saving}>
            {editingId ? "Сохранить изменения" : "Добавить товар"}
          </Button>
          {editingId && (
            <Button variant="ghost" type="button" onClick={resetForm}>
              Отмена
            </Button>
          )}
        </div>
      </form>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {loading ? (
        <div className="py-16 text-center text-gray-400">Загрузка...</div>
      ) : (
        <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-[0.5px]">
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
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 border-b border-gray-200 text-sm last:border-b-0 text-[#1a1a1a]"
            >
              <span>{item.item_name}</span>
              <span className="text-gray-400">{item.sku ?? "—"}</span>
              <span>{parseFloat(String(item.unit_price)).toFixed(2)} ₽</span>
              <span>{item.quantity}</span>
              <span>
                {categories.find((c) => c.id === item.category_id)?.category ??
                  "—"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  ✏️
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
