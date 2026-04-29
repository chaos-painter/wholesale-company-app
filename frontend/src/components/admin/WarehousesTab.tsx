import { useEffect, useState } from "react";
import {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../../api/warehouses";
import type { Warehouse } from "../../types";

export default function WarehousesTab() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    location_name: "",
    address: "",
    capacity: "",
  });
  const [saving, setSaving] = useState(false);

  const load = () =>
    listWarehouses()
      .then(setWarehouses)
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

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
    const data = {
      location_name: form.location_name,
      address: form.address || null,
      capacity: form.capacity ? Number(form.capacity) : null,
    };
    if (editingId) {
      await updateWarehouse(editingId, data).catch(() => {});
    } else {
      await createWarehouse(data).catch(() => {});
    }
    resetForm();
    setSaving(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить склад?")) return;
    await deleteWarehouse(id).catch(() => {});
    load();
  };

  if (loading)
    return <div className="py-16 text-center text-[#484848]">Загрузка...</div>;

  const inputClasses =
    "px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm placeholder:text-[#484848] focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-colors";

  return (
    <div>
      {/* Warehouse Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
      >
        <h3 className="text-[#1a1a1a]">
          {editingId ? "Редактировать склад" : "Добавить склад"}
        </h3>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Название *
            </label>
            <input
              required
              value={form.location_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, location_name: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Адрес
            </label>
            <input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1a1a1a]">
              Вместимость
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm((f) => ({ ...f, capacity: e.target.value }))
              }
              className={inputClasses}
            />
          </div>
        </div>

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
            {saving ? "Сохранение..." : editingId ? "Сохранить" : "Добавить"}
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

      {/* Warehouses Table */}
      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        <div
          className="grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-3 px-5 py-3 
                        bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-[#484848] 
                        uppercase tracking-[0.5px]"
        >
          <span>ID</span>
          <span>Название</span>
          <span>Адрес</span>
          <span>Вместимость</span>
          <span></span>
        </div>

        {warehouses.map((w) => (
          <div
            key={w.id}
            className="grid grid-cols-[1fr_2fr_2fr_1fr_auto] gap-3 px-5 py-3 
                       border-b border-gray-200 text-sm last:border-b-0 items-center"
          >
            <span className="text-[#484848]">#{w.id}</span>
            <span className="text-[#1a1a1a]">{w.location_name}</span>
            <span className="text-[#484848]">{w.address ?? "—"}</span>
            <span className="text-[#1a1a1a]">{w.capacity ?? "—"}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(w)}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                           border border-gray-300 text-[#1a1a1a] font-medium text-[13px]
                           hover:border-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                           transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(w.id)}
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
    </div>
  );
}
