import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { token, email, role, logout, isManager } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/catalog" className="navbar-logo">
          <div className="logo-icon">W</div>
          <span>WholesalePro</span>
        </Link>

        <div className="navbar-links">
          <Link to="/catalog">Каталог</Link>
          {token && <Link to="/orders">Мои заказы</Link>}
          {isManager && <Link to="/admin">Управление</Link>}
        </div>

        <div className="navbar-actions">
          {token ? (
            <>
              <Link to="/cart" className="cart-btn" title="Корзина">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 7h12M7 13L5.4 5M9 21a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                {count > 0 && <span className="cart-badge">{count}</span>}
              </Link>
              <div className="user-info">
                <span className="user-email">{email}</span>
                <span className={`role-pill role-${role}`}>{role}</span>
              </div>
              <button onClick={handleLogout} className="btn-ghost btn-sm">Выйти</button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-ghost btn-sm">Войти</Link>
              <Link to="/register" className="btn-primary btn-sm">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
