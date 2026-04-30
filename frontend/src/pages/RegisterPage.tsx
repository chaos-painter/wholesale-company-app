import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ErrorBanner from "../components/ui/ErrorBanner";
import AuthLayout from "../components/layouts/AuthLayout";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[420px] bg-[#dadada] border border-gray-200 rounded-2xl p-10 px-9 shadow-md">
        <div className="text-center mb-7 flex flex-col items-center gap-3">
          <h1 className="text-2xl text-[#1a1a1a]">Zereke</h1>
          <p className="text-gray-400 text-sm">Создайте аккаунт покупателя</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          {error && <ErrorBanner message={error} />}
          <Input
            id="reg-name"
            label="Имя"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            required
            autoFocus
          />
          <Input
            id="reg-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            id="reg-password"
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 8 символов"
            required
            minLength={6}
          />
          <Button type="submit" fullWidth disabled={loading} loading={loading}>
            Зарегистрироваться
          </Button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-400">
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="text-[#1a1a1a] font-semibold hover:opacity-70 transition-opacity"
          >
            Войти
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
