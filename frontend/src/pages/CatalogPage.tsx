import { useEffect, useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ui/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import MainLayout from "../components/layouts/MainLayout";
import { Search } from "lucide-react";

const categoryButtonClasses = (isActive: boolean) =>
  `w-full text-left px-2.5 py-2 rounded-md text-sm transition-colors
   hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]
   ${isActive ? "bg-[rgba(0,0,0,0.04)] text-[#1a1a1a] font-semibold" : "text-gray-400"}
   max-md:w-auto`;

export default function CatalogPage() {
  const { items, loading, error, loadItems } = useInventory();
  const { categories, loadCategories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems({ search: search || undefined, category_id: categoryId });
  }, [search, categoryId]);

  return (
    <MainLayout>
      <div className="flex gap-7 items-start max-md:flex-col">
        <aside className="w-55 shrink-0 sticky top-22 bg-[#dadada] border border-gray-200 rounded-lg p-5 max-md:w-full max-md:static">
          <h3 className="text-[13px] uppercase tracking-[0.8px] text-gray-400 mb-3">
            Категории
          </h3>
          <ul className="flex flex-col gap-0.5 max-md:flex-row max-md:flex-wrap max-md:gap-1.5">
            <li>
              <button
                className={categoryButtonClasses(!categoryId)}
                onClick={() => setCategoryId(undefined)}
              >
                Все товары
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  className={categoryButtonClasses(categoryId === c.id)}
                  onClick={() => setCategoryId(c.id)}
                >
                  {c.category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="shrink-0 text-[#1a1a1a]">Каталог товаров</h2>
            <div className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 rounded-lg bg-[#dadada] flex-1 max-w-85 transition-colors focus-within:border-[#1a1a1a] focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none bg-transparent outline-none flex-1 text-sm text-[#1a1a1a] placeholder:text-gray-400"
              />
            </div>
          </div>

          {error && <ErrorBanner message={error} className="mb-4" />}

          {loading ? (
            <LoadingSkeleton />
          ) : items.length === 0 ? (
            <EmptyState message="Товары не найдены" />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4.5">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
