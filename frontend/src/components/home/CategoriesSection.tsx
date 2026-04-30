import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { listCategories } from "../../api/categories";
import type { Category } from "../../types";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-px bg-gray-300" />
              <span className="text-xs font-semibold tracking-[1.5px] uppercase text-gray-400">
                Категории
              </span>
            </div>
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-3">
              Покупки по категориям
            </h2>
            <p className="text-gray-500 text-lg">
              Тысячи SKU во всех основных товарных категориях.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-[#1a1a1a] font-medium text-sm 
                       hover:opacity-60 transition-opacity self-start md:self-auto
                       border-b border-[#1a1a1a] pb-1"
          >
            Все категории
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#dadada] rounded-xl p-6 animate-pulse"
              >
                <div className="h-5 bg-[#c5c5c5] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#c5c5c5] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.slice(0, 6).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.07 * i }}
                className="bg-[#dadada] rounded-xl p-6 cursor-pointer hover:bg-[#d0d0d0] transition-all border border-transparent hover:border-gray-300"
              >
                <Link to={`/catalog?category=${cat.id}`} className="block">
                  <div className="font-semibold text-[#1a1a1a] text-lg mb-1">
                    {cat.category}
                  </div>
                  <div className="text-sm text-gray-400">
                    Перейти к товарам →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Категории скоро появятся
          </div>
        )}
      </div>
    </section>
  );
}
