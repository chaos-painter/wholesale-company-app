import { Package2, Mail, Phone, MapPin, Clock } from "lucide-react";

let company_info = {
  address: " г. Астана, р-н. Есиль, ул. Туркистан, д. 8, оф. 116",
  phone_number: "+7 (495) 123-45-67",
  email: "hello@zereke.com",
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-[#e5e5e5] flex items-center justify-center">
                <Package2 className="h-5 w-5 text-[#1a1a1a]" />
              </div>
              <span className="font-bold text-xl text-[#e5e5e5]">Zereke</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Оптовая платформа для бизнеса, который работает быстро.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Контакты
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@zereke.ru"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#e5e5e5] transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {company_info.email}
                </a>
              </li>
              <li>
                <a
                  href="tel:+74951234567"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-[#e5e5e5] transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {company_info.phone_number}
                </a>
              </li>
            </ul>
          </div>

          {/* Address & Hours */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Адрес
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{company_info.address}</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Пн–Пт: 9:00 – 18:00
                  <br />
                  Сб: 10:00 – 15:00
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-gray-500">
            &copy; {year} Zereke. Все права защищены.
          </p>
          <p className="text-sm text-gray-600">
            Оптовые цены доступны для зарегистрированных бизнес-покупателей.
          </p>
        </div>
      </div>
    </footer>
  );
}
