import { useEffect, useState } from "react";
import { listInventory } from "../api/inventory";
import { listCategories } from "../api/categories";
import ProductCard from "../components/ui/ProductCard";
import type { InventoryItem, Category } from "../types";

export default function CatalogPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    listInventory({ search: search || undefined, category_id: categoryId })
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div className="flex gap-7 items-start max-md:flex-col bg-[#e5e5e5]">
      {/* Sidebar */}
      <aside
        className="w-55 shrink-0 sticky top-22
                         bg-[#dadada] border border-gray-200 rounded-lg p-5
                         max-md:w-full max-md:static"
      >
        <h3 className="text-[13px] uppercase tracking-[0.8px] text-[#484848] mb-3">
          Категории
        </h3>
        <ul className="flex flex-col gap-0.5 max-md:flex-row max-md:flex-wrap max-md:gap-1.5">
          <li>
            <button
              className={`w-full text-left px-2.5 py-2 rounded-md text-sm text-[#484848]
                         transition-colors hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]
                         ${!categoryId ? "bg-[rgba(0,0,0,0.04)] text-[#1a1a1a] font-semibold" : ""}
                         max-md:w-auto`}
              onClick={() => setCategoryId(undefined)}
            >
              Все товары
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                className={`w-full text-left px-2.5 py-2 rounded-md text-sm text-[#484848]
                           transition-colors hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]
                           ${categoryId === c.id ? "bg-[rgba(0,0,0,0.04)] text-[#1a1a1a] font-semibold" : ""}
                           max-md:w-auto`}
                onClick={() => setCategoryId(c.id)}
              >
                {c.category}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="shrink-0 text-[#1a1a1a]">Каталог товаров</h2>
          <div
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 rounded-lg 
                          bg-[#dadada] flex-1 max-w-85 transition-colors
                          focus-within:border-[#1a1a1a] focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="shrink-0 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none bg-transparent outline-none flex-1 text-sm text-[#1a1a1a] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-2.5 px-3.5 mb-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4.5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-60 rounded-lg bg-gray-200 animate-[pulse_1.5s_ease-in-out_infinite]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center gap-3.5 py-20 px-6 text-center text-gray-400">
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
              opacity={0.3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11"
              />
            </svg>
            <p>Товары не найдены</p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4.5">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} categories={categories} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
