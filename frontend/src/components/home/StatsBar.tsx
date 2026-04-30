import { motion } from "motion/react";

const stats = [
  { value: "10,000+", label: "Доступных товаров" },
  { value: "50+", label: "Категорий товаров" },
  { value: "99.8%", label: "Точность заказов" },
  { value: "48ч", label: "Среднее время отправки" },
];

export default function StatsBar() {
  return (
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
  );
}
