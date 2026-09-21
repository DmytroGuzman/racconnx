"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error ?? "Не вдалося увійти.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Помилка з'єднання.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05070b] px-6 py-20 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <form
          onSubmit={submit}
          className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">
            RaccoonX
          </p>

          <h1 className="mt-3 text-3xl font-black">Admin Panel</h1>

          <p className="mt-2 text-sm text-white/40">
            Увійди, щоб керувати RaccoonX.
          </p>

          <label className="mt-8 block text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            Пароль
          </label>

          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-green-400/40"
            placeholder="••••••••••••"
          />

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <button
            disabled={loading || !password}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-green-400 px-5 py-4 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>
      </div>
    </main>
  );
}
