"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  delivered: number;
  processing: number;
  failed: number;
  uniqueBuyers: number;
  solReceived: number;
  rcxSold: number;
};

export default function AdminOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/overview", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error ?? "Load failed");
        return data.stats as Stats;
      })
      .then((value) => value && setStats(value))
      .catch((err) => setError(err instanceof Error ? err.message : "Помилка."));
  }, [router]);

  const cards = stats
    ? [
        ["Delivered", stats.delivered.toLocaleString()],
        ["SOL received", stats.solReceived.toLocaleString("en-US", { maximumFractionDigits: 9 })],
        ["RCX sold", stats.rcxSold.toLocaleString("en-US", { maximumFractionDigits: 9 })],
        ["Unique buyers", stats.uniqueBuyers.toLocaleString()],
        ["Processing", stats.processing.toLocaleString()],
        ["Failed", stats.failed.toLocaleString()],
      ]
    : [];

  return (
    <div className="px-6 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">Dashboard</p>
      <h1 className="mt-2 text-3xl font-black">Overview</h1>
      <p className="mt-2 text-white/40">Статистика продажів із Neon.</p>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      {!stats ? (
        <div className="mt-8 text-white/35">Завантаження...</div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">{label}</p>
              <p className="mt-3 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
