import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ErrorBanner from "../components/ui/ErrorBanner";
import AuthLayout from "../components/layouts/AuthLayout";

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
    <AuthLayout>
      <div className="w-full max-w-[420px] bg-[#dadada] border border-gray-200 rounded-2xl p-10 px-9 shadow-md">
        <div className="text-center mb-7 flex flex-col items-center gap-3">
          <h1 className="text-2xl text-[#1a1a1a]">Zereke</h1>
          <p className="text-gray-400 text-sm">Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          {error && <ErrorBanner message={error} />}
          <Input
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
          <Input
            id="login-password"
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" fullWidth disabled={loading} loading={loading}>
            Войти
          </Button>
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
    </AuthLayout>
  );
}
