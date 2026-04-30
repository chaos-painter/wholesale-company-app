import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const { token } = useAuth();

  return (
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
  );
}
