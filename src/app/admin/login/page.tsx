"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка входа");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        <p className="text-sm text-[var(--text-muted)]">Логин: admin / admin123 (по умолчанию)</p>
        <input
          name="username"
          placeholder="Логин"
          required
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          required
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
