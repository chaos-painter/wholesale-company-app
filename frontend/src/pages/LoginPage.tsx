import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await login(email, password);
      setToken(token);
      navigate("/catalog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6">
      <div className="w-full max-w-105 bg-[#dadada] border border-gray-200 rounded-2xl p-10 px-9 shadow-md">
        {/* Header */}
        <div className="text-center mb-7 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] text-[#e5e5e5] flex items-center justify-center font-extrabold text-2xl">
            W
          </div>
          <h1 className="text-2xl text-[#1a1a1a]">WholesalePro</h1>
          <p className="text-gray-400 text-sm">Войдите в свой аккаунт</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {error && (
            <div className="py-2.5 px-3.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-[13px] font-semibold text-[#1a1a1a]"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm
                         placeholder:text-gray-400
                         focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]
                         transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-[13px] font-semibold text-[#1a1a1a]"
            >
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg bg-[#c5c5c5] text-[#1a1a1a] text-sm
                         placeholder:text-gray-400
                         focus:outline-none focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]
                         transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-lg
                       bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-sm w-full
                       hover:bg-[#333] active:scale-[0.98]
                       disabled:opacity-55 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-400">
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="text-[#1a1a1a] font-semibold hover:opacity-70 transition-opacity"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
