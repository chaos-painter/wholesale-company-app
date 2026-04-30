import { useWarehouses } from "../../hooks/useWarehouses";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ErrorBanner from "../ui/ErrorBanner";
import { useState } from "react";
import type { Warehouse } from "../../types";

export default function WarehousesTab() {
  const {
    warehouses,
    loading,
    error,
    addWarehouse,
    updateWarehouse,
    removeWarehouse,
  } = useWarehouses();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    location_name: "",
    address: "",
    capacity: "",
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ location_name: "", address: "", capacity: "" });
    setEditingId(null);
  };

  const handleEdit = (wh: Warehouse) => {
    setEditingId(wh.id);
    setForm({
      location_name: wh.location_name,
      address: wh.address ?? "",
      capacity: wh.capacity ? String(wh.capacity) : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        location_name: form.location_name,
        address: form.address || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };
      if (editingId) {
        await updateWarehouse(editingId, data);
      } else {
        await addWarehouse(data);
      }
      resetForm();
    } catch {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить склад?")) return;
    await removeWarehouse(id).catch(() => {});
  };

  if (loading)
    return <div className="py-16 text-center text-gray-400">Загрузка...</div>;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
      >
        <h3 className="text-[#1a1a1a]">
          {editingId ? "Редактировать склад" : "Добавить склад"}
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <Input
            label="Название *"
            required
            value={form.location_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, location_name: e.target.value }))
            }
          />
          <Input
            label="Адрес"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
          <Input
            label="Вместимость"
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm((f) => ({ ...f, capacity: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-4">
          <Button type="submit" disabled={saving} loading={saving}>
            {editingId ? "Сохранить" : "Добавить"}
          </Button>
          {editingId && (
            <Button variant="ghost" type="button" onClick={resetForm}>
              Отмена
            </Button>
          )}
        </div>
      </form>

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-3 px-5 py-3 bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-[0.5px]">
          <span>ID</span>
          <span>Название</span>
          <span>Адрес</span>
          <span>Вместимость</span>
          <span></span>
        </div>
        {warehouses.map((w) => (
          <div
            key={w.id}
            className="grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-3 px-5 py-3 border-b border-gray-200 text-sm last:border-b-0 items-center"
          >
            <span className="text-gray-400">#{w.id}</span>
            <span className="text-[#1a1a1a]">{w.location_name}</span>
            <span className="text-gray-400">{w.address ?? "—"}</span>
            <span className="text-[#1a1a1a]">{w.capacity ?? "—"}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(w)}>
                ✏️
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(w.id)}
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
