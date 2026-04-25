import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
      </svg>
    ),
    title: 'Большой каталог',
    desc: 'Тысячи позиций товаров с фильтрацией по категориям, складам и остаткам.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Простые заказы',
    desc: 'Добавляйте товары в корзину и оформляйте оптовые заказы в несколько кликов.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Управление складом',
    desc: 'Отслеживайте остатки, управляйте категориями и следите за статусами заказов.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Ролевой доступ',
    desc: 'Разные права для покупателей, менеджеров и администраторов.',
  },
];

export default function HomePage() {
  const { token } = useAuth();

  return (
    <div className="home-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-badge">Оптовая торговля</div>
        <h1 className="hero-title">
          Wholesale<br />
          <span className="hero-accent">Storefront</span>
        </h1>
        <p className="hero-sub">
          Современная B2B-платформа для оптовых закупок.<br />
          Каталог, заказы, склады — всё в одном месте.
        </p>
        <div className="hero-cta">
          <Link to="/catalog" className="btn-primary btn-lg">
            Перейти в каталог
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {!token && (
            <Link to="/register" className="btn-ghost btn-lg">
              Создать аккаунт
            </Link>
          )}
          {token && (
            <Link to="/orders" className="btn-ghost btn-lg">
              Мои заказы
            </Link>
          )}
        </div>

        {/* decorative grid */}
        <div className="hero-grid" aria-hidden="true">
          {[...Array(24)].map((_, i) => <div key={i} className="hero-grid-cell" />)}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="section-divider" />

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="features-section">
        <p className="section-label">Возможности платформы</p>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="section-divider" />

      {/* ── CTA bottom ───────────────────────────────────────── */}
      <section className="cta-section">
        <h2>Готовы начать?</h2>
        <p>Зарегистрируйтесь и получите доступ к каталогу прямо сейчас.</p>
        <div className="hero-cta">
          {!token ? (
            <>
              <Link to="/register" className="btn-primary btn-lg">Зарегистрироваться</Link>
              <Link to="/login" className="btn-ghost btn-lg">Войти</Link>
            </>
          ) : (
            <Link to="/catalog" className="btn-primary btn-lg">Открыть каталог</Link>
          )}
        </div>
      </section>

      <div className="section-divider" />
      <footer className="home-footer">
        <span>Wholesale Storefront</span>
      </footer>

    </div>
  );
}
