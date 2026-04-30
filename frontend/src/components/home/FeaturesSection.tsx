import { motion } from "motion/react";
import { Package, ShieldCheck, Truck, BarChart3 } from "lucide-react";

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

export default function FeaturesSection() {
  return (
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
  );
}
