import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { token, email, role, logout, isManager } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const rolePillClasses = {
    admin: "bg-[rgba(239,68,68,0.12)] text-danger",
    manager: "bg-[rgba(245,158,11,0.12)] text-warning",
    customer: "bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]",
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 h-15 bg-[#e5e5e5] border-b border-dashed border-gray-400 backdrop-blur-md">
      <div className="max-w-300 mx-auto px-6 h-full flex items-center gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-[17px] text-[#1a1a1a] shrink-0"
          onClick={closeMenu}
        >
          <span>Zereke</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <Link
            to="/catalog"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 
                       hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
          >
            Каталог
          </Link>
          {token && (
            <Link
              to="/orders"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 
                         hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              Мои заказы
            </Link>
          )}
          {isManager && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 
                         hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              Управление
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          {token ? (
            <>
              <Link
                to="/cart"
                title="Корзина"
                className="relative flex items-center justify-center w-9.5 h-9.5 rounded-lg 
                           text-gray-500 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 7h12M7 13L5.4 5M9 21a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
                {count > 0 && (
                  <span
                    className="absolute top-0.5 right-0.5 min-w-4 h-4 rounded-lg 
                                   bg-[#1a1a1a] text-[#e5e5e5] text-[10px] font-bold 
                                   flex items-center justify-center px-0.75"
                  >
                    {count}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-500 max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
                  {email}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-[20px] uppercase tracking-[0.5px] ${
                    rolePillClasses[role as keyof typeof rolePillClasses] ||
                    rolePillClasses.customer
                  }`}
                >
                  {role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                           border border-gray-300 text-gray-500 font-medium text-[13px]
                           hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                           transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg
                           border border-gray-300 text-gray-500 font-medium text-[13px]
                           hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                           transition-colors"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                           bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-[13px]
                           hover:bg-[#333] active:scale-[0.97]
                           transition-all duration-200"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          {token && (
            <Link
              to="/cart"
              title="Корзина"
              className="relative flex items-center justify-center w-9.5 h-9.5 rounded-lg 
                         text-gray-500 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 7h12M7 13L5.4 5M9 21a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
              {count > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 min-w-4 h-4 rounded-lg 
                                 bg-[#1a1a1a] text-[#e5e5e5] text-[10px] font-bold 
                                 flex items-center justify-center px-0.75"
                >
                  {count}
                </span>
              )}
            </Link>
          )}

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-9.5 h-9.5 rounded-lg 
                       text-gray-500 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#e5e5e5] border-t border-gray-200">
          <div className="px-6 py-4 flex flex-col gap-1">
            <Link
              to="/catalog"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-500 
                         hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              Каталог
            </Link>
            {token && (
              <Link
                to="/orders"
                onClick={closeMenu}
                className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-500 
                           hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
              >
                Мои заказы
              </Link>
            )}
            {isManager && (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="px-3 py-2.5 rounded-md text-sm font-medium text-gray-500 
                           hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
              >
                Управление
              </Link>
            )}
          </div>

          {/* Mobile User Info & Auth */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col gap-3">
            {token ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-500 truncate max-w-48">
                    {email}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-[20px] uppercase tracking-[0.5px] ${
                      rolePillClasses[role as keyof typeof rolePillClasses] ||
                      rolePillClasses.customer
                    }`}
                  >
                    {role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg
                             border border-gray-300 text-gray-500 font-medium text-[13px] w-full
                             hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                             transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg
                             border border-gray-300 text-gray-500 font-medium text-[13px] flex-1
                             hover:border-gray-400 hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)]
                             transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                             bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-[13px] flex-1
                             hover:bg-[#333] active:scale-[0.97]
                             transition-all duration-200"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
