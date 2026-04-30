import { useCategories } from "../../hooks/useCategories";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ErrorBanner from "../ui/ErrorBanner";
import { useState } from "react";

export default function CategoriesTab() {
  const { categories, loading, error, addCategory, removeCategory } =
    useCategories();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await addCategory(name).catch(() => {});
    setName("");
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;
    await removeCategory(id).catch(() => {});
  };

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="bg-[#dadada] border border-gray-200 rounded-lg p-6 mb-7 flex flex-col gap-4"
      >
        <h3 className="text-[#1a1a1a]">Добавить категорию</h3>
        <div className="grid grid-cols-[1fr_auto] gap-3.5 items-end">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название категории"
            required
          />
          <Button type="submit" disabled={saving} loading={saving}>
            Добавить
          </Button>
        </div>
      </form>

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="bg-[#dadada] border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_auto] gap-3 px-5 py-3 bg-[#c5c5c5] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-[0.5px]">
          <span>ID</span>
          <span>Название</span>
          <span></span>
        </div>
        {categories.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[2fr_1fr_auto] gap-3 px-5 py-3 border-b border-gray-200 text-sm last:border-b-0 text-[#1a1a1a]"
          >
            <span className="text-gray-400">#{c.id}</span>
            <span>{c.category}</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(c.id)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
