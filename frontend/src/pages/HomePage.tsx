import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import Footer from "../components/ui/Footer";
import { listCategories } from "../api/categories";
import type { Category } from "../types";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Truck,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Доступных товаров" },
  { value: "50+", label: "Категорий товаров" },
  { value: "99.8%", label: "Точность заказов" },
  { value: "48ч", label: "Среднее время отправки" },
];

const features = [
  {
    icon: Package,
    title: "Оптовые ценовые уровни",
    description:
      "Получайте большие скидки по мере роста объёма заказов. Прозрачные ценовые уровни без скрытых комиссий.",
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    description:
      "Заказы отправляются в течение 48 часов с наших складов по всей стране.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия качества",
    description:
      "Каждый товар соответствует строгим стандартам качества. Полная политика возврата на все оптовые заказы.",
  },
  {
    icon: BarChart3,
    title: "Бизнес-аналитика",
    description:
      "Отслеживайте заказы, расходы и графики пополнения запасов в удобной панели покупателя.",
  },
];

export default function HomePage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  return (
    <div className="absolute left-0 right-0 -mt-[88px] -mb-12 max-md:-mt-[80px] max-md:-mb-10">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#e5e5e5]">
        <div className="absolute inset-0">
          <div className="absolute inset-0" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-28 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[1.5px] uppercase text-gray-400 mb-8">
              <span className="w-6 h-px bg-gray-300" />
              Оптовая платформа
              <span className="w-6 h-px bg-gray-300" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-[-2px] text-[#1a1a1a] mb-6">
              Закупайте умнее.
              <br />
              <span className="text-[#1a1a1a]/80">Масштабируйтесь</span>
              <br />
              быстрее.
            </h1>
            <p className="text-lg text-gray-500 mb-12 max-w-xl leading-relaxed">
              Тысячи товаров по оптовым ценам. Создано для розничных магазинов,
              дистрибьюторов и бизнес-покупателей, которым важны объём, качество
              и скорость.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                           bg-[#1a1a1a] text-[#e5e5e5] font-medium text-sm
                           hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
              >
                Перейти в каталог
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!token ? (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg
                             border border-gray-300 text-gray-500 font-medium text-sm
                             hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-gray-100 transition-all"
                >
                  Создать аккаунт
                </Link>
              ) : (
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg
                             border border-gray-300 text-gray-500 font-medium text-sm
                             hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-gray-100 transition-all"
                >
                  Мои заказы
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="border-t border-gray-200 bg-[#262626]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i, ease: "easeOut" }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-[#e5e5e5] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-px bg-gray-600" />
              <span className="text-xs font-semibold tracking-[1.5px] uppercase text-gray-400">
                Возможности платформы
              </span>
            </div>
            <h2 className="text-4xl font-bold text-[#e5e5e5] mb-4">
              Почему покупатели выбирают нас
            </h2>
            <p className="text-gray-400 max-w-xl text-lg">
              Всё, что нужно растущему бизнесу для надёжных поставок в любом
              объёме.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#333] rounded-xl overflow-hidden">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="bg-[#222] p-8 hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#e5e5e5] flex items-center justify-center mb-6">
                  <feature.icon className="h-5 w-5 text-[#1a1a1a]" />
                </div>
                <h3 className="font-semibold text-[#e5e5e5] text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
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

          {categoriesLoading ? (
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

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="bg-[#e5e5e5] py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">
            Готовы начать оптовые закупки?
          </h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Изучите полный каталог и получите оптовые цены на тысячи товаров уже
            сегодня.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {!token ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                             bg-[#1a1a1a] text-[#e5e5e5] font-medium text-sm
                             hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
                >
                  Зарегистрироваться
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg
                             border border-gray-300 text-gray-500 font-medium text-sm
                             hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-gray-100 transition-all"
                >
                  Войти
                </Link>
              </>
            ) : (
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                           bg-[#1a1a1a] text-[#e5e5e5] font-medium text-sm
                           hover:bg-[#333] active:scale-[0.98] transition-all duration-200"
              >
                Открыть каталог
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
