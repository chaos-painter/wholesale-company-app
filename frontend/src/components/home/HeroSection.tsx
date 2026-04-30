import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";

export default function HeroSection() {
  const { token } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#e5e5e5] pt-[60px]">
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
            дистрибьюторов и бизнес-покупателей, которым важны объём, качество и
            скорость.
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
  );
}
