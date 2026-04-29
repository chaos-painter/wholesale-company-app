import { useEffect, useState } from "react";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../../api/categories";
import type { Category } from "../../types";

export default function CategoriesTab() {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => listCategories().then(setCats);
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createCategory(name).catch(() => {});
    setName("");
    setSaving(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;
    await deleteCategory(id).catch(() => {});
    load();
  };

  return (
    <div>
      {/* Add Category Form */}
      <form
        onSubmit={handleCreate}
        className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
      >
        <h3 className="text-[#1a1a1a]">Добавить категорию</h3>
        <div className="grid grid-cols-[1fr_auto] gap-3.5 items-end">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название категории"
            required
            className="px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm
                       placeholder:text-[#484848]
                       focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]
                       transition-colors"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                       bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm
                       hover:bg-[#333] active:scale-[0.98]
                       disabled:opacity-55 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            {saving ? "..." : "Добавить"}
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div
          className="grid grid-cols-[2fr_1fr_auto] gap-3 px-5 py-3 bg-[#c5c5c5] 
                        border-b border-gray-200 text-xs font-bold text-[#484848] uppercase 
                        tracking-[0.5px]"
        >
          <span>ID</span>
          <span>Название</span>
          <span></span>
        </div>

        {/* Table Rows */}
        {cats.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[2fr_1fr_auto] gap-3 px-5 py-3 border-b border-gray-200 
                       text-sm last:border-b-0 text-[#1a1a1a]"
          >
            <span className="text-[#484848]">#{c.id}</span>
            <span>{c.category}</span>
            <button
              onClick={() => handleDelete(c.id)}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                         bg-[rgba(239,68,68,0.08)] text-[#dc2626] 
                         border border-[rgba(239,68,68,0.2)] font-semibold text-[13px]
                         hover:bg-[rgba(239,68,68,0.15)] transition-colors"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
