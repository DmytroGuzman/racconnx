"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  onlineNow: number;
  visitorsToday: number;
  totalVisitors: number;
  pageViews: number;
};

type Day = {
  day: string;
  visitors: number;
  pageViews: number;
};

export default function VisitorAnalytics() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Analytics failed.");
      }

      setStats(data.stats);
      setDays(data.days);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analytics error.");
    }
  }, [router]);

  useEffect(() => {
    void load();

    // Online counter refreshes automatically.
    const interval = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const maxVisitors = useMemo(
    () => Math.max(1, ...days.map((day) => day.visitors)),
    [days]
  );

  if (error) {
    return (
      <section className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 text-sm text-red-300">
        Visitor analytics: {error}
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-white/35">
        Завантаження статистики відвідувачів...
      </section>
    );
  }

  const cards = [
    ["Online now", stats.onlineNow.toLocaleString(), true],
    ["Visitors today", stats.visitorsToday.toLocaleString(), false],
    ["Total visitors", stats.totalVisitors.toLocaleString(), false],
    ["Page views", stats.pageViews.toLocaleString(), false],
  ] as const;

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-400">
            Website Analytics
          </p>
          <h2 className="mt-2 text-xl font-black">Visitors</h2>
          <p className="mt-1 text-sm text-white/35">
            Online оновлюється автоматично кожні 30 секунд.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/55 hover:bg-white/[0.05]"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, online]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
          >
            <div className="flex items-center gap-2">
              {online && (
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,.65)]" />
              )}
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
                {label}
              </p>
            </div>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
        <div>
          <p className="font-black">Visitors — last 7 days</p>
          <p className="mt-1 text-xs text-white/30">
            Unique browsers per day
          </p>
        </div>

        <div className="mt-8 flex h-52 items-end gap-3">
          {days.map((day) => (
            <div
              key={day.day}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[10px] text-white/40">
                {day.visitors}
              </span>

              <div
                className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-purple-500 to-green-400"
                style={{
                  height: `${Math.max(
                    5,
                    (day.visitors / maxVisitors) * 150
                  )}px`,
                }}
                title={`${day.visitors} visitors / ${day.pageViews} views`}
              />

              <span className="max-w-full truncate text-[9px] text-white/25">
                {new Date(`${day.day}T00:00:00`).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-white/25">
        Unique visitor = один браузер із локальним анонімним ID. IP-адреси ця
        статистика не зберігає.
      </p>
    </section>
  );
}
