"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VisitorAnalytics from "@/components/admin/VisitorAnalytics";

type Overview = {
  delivered: number;
  processing: number;
  failed: number;
  uniqueBuyers: number;
  solReceived: number;
  rcxSold: number;
};

type Health = {
  rpc: boolean;
  database: boolean;
  slot: number;
  saleWallet: { address: string; sol: number; rcx: number };
  treasury: { address: string; sol: number };
  token: { mint: string; decimals: number; supply: number };
};

type Sale = {
  active: boolean;
  rcxPerSol: number;
  minPurchaseSol: number;
  maxPurchaseSol: number;
};

type Day = {
  day: string;
  purchases: number;
  sol: number;
  rcx: number;
};

const short = (v: string) => `${v.slice(0, 5)}...${v.slice(-5)}`;

export default function AdminV3Dashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    setError("");

    Promise.all([
      fetch("/api/admin/overview", { cache: "no-store" }),
      fetch("/api/admin/health", { cache: "no-store" }),
      fetch("/api/admin/sale", { cache: "no-store" }),
      fetch("/api/admin/chart", { cache: "no-store" }),
    ])
      .then(async (responses) => {
        if (responses.some((r) => r.status === 401)) {
          router.replace("/admin/login");
          return null;
        }

        const [o, h, s, c] = await Promise.all(responses.map((r) => r.json()));

        if (!o.ok) throw new Error(o.error ?? "Overview failed");
        if (!h.ok) throw new Error(h.error ?? "Health failed");
        if (!s.ok) throw new Error(s.error ?? "Sale settings failed");
        if (!c.ok) throw new Error(c.error ?? "Chart failed");

        return [o.stats, h.health, s.settings, c.days] as [Overview, Health, Sale, Day[]];
      })
      .then((data) => {
        if (!data) return;
        setOverview(data[0]);
        setHealth(data[1]);
        setSale(data[2]);
        setDays(data[3]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Dashboard error."))
      .finally(() => setRefreshing(false));
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const remainingSaleSol = useMemo(() => {
    if (!health || !sale || sale.rcxPerSol <= 0) return 0;
    return health.saleWallet.rcx / sale.rcxPerSol;
  }, [health, sale]);

  const maxPurchases = Math.max(1, ...days.map((d) => d.purchases));

  if (error) {
    return <div className="p-8 text-red-400">Admin v3 error: {error}</div>;
  }

  if (!overview || !health || !sale) {
    return <div className="p-8 text-white/40">Завантаження Admin Panel v3...</div>;
  }

  const cards = [
    ["SOL received", overview.solReceived.toLocaleString("en-US", { maximumFractionDigits: 9 })],
    ["RCX sold", overview.rcxSold.toLocaleString("en-US", { maximumFractionDigits: 2 })],
    ["Delivered", overview.delivered.toLocaleString()],
    ["Unique buyers", overview.uniqueBuyers.toLocaleString()],
  ];

  return (
    <div className="px-6 py-10">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-400">
            RaccoonX CONTROL CENTER
          </p>
          <h1 className="mt-2 text-3xl font-black">Overview</h1>
          <p className="mt-2 text-white/40">
            Продажі, резерв токенів та стан інфраструктури.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void loadDashboard()}
            disabled={refreshing}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/60 hover:bg-white/[0.05] disabled:opacity-40"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
          <div className={`w-fit rounded-full border px-4 py-2 text-xs font-black ${
          sale.active
            ? "border-green-400/20 bg-green-400/[0.06] text-green-400"
            : "border-red-400/20 bg-red-400/[0.06] text-red-300"
        }`}>
          {sale.active ? "● SALE ACTIVE" : "● SALE PAUSED"}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black">Sale Wallet</p>
              <p className="mt-1 font-mono text-xs text-white/30">{short(health.saleWallet.address)}</p>
            </div>
            <a
              href={`https://solscan.io/account/${health.saleWallet.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-purple-400"
            >
              Solscan ↗
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label="SOL balance" value={health.saleWallet.sol.toLocaleString("en-US", { maximumFractionDigits: 9 })} />
            <Metric label="RCX available" value={health.saleWallet.rcx.toLocaleString("en-US", { maximumFractionDigits: 2 })} />
            <Metric label="Sale capacity" value={`${remainingSaleSol.toLocaleString("en-US", { maximumFractionDigits: 4 })} SOL`} />
          </div>

          <p className="mt-5 text-xs leading-5 text-white/30">
            Sale capacity = баланс RCX / поточний курс {sale.rcxPerSol.toLocaleString("en-US")} RCX за 1 SOL.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <p className="font-black">Token Supply</p>
          <p className="mt-1 text-xs text-white/30">Mint supply on Solana</p>
          <p className="mt-6 text-3xl font-black">
            {health.token.supply.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-green-400">RCX</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">
          <div>
            <p className="font-black">Purchases — last 14 days</p>
            <p className="mt-1 text-xs text-white/30">Delivered purchases per day</p>
          </div>

          <div className="mt-8 flex h-52 items-end gap-2">
            {days.length === 0 ? (
              <div className="m-auto text-sm text-white/30">Ще немає даних для графіка.</div>
            ) : (
              days.map((day) => (
                <div key={day.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] text-white/35">{day.purchases}</span>
                  <div
                    className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-purple-500 to-green-400"
                    style={{ height: `${Math.max(5, (day.purchases / maxPurchases) * 150)}px` }}
                    title={`${day.purchases} purchases`}
                  />
                  <span className="max-w-full truncate text-[9px] text-white/25">
                    {new Date(day.day).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <p className="font-black">Sale Health</p>
          <div className="mt-5 space-y-3">
            <HealthRow label="Solana RPC" ok={health.rpc} />
            <HealthRow label="Neon Database" ok={health.database} />
            <HealthRow label="Sale Wallet" ok={Boolean(health.saleWallet.address)} />
            <HealthRow label="Treasury" ok={Boolean(health.treasury.address)} />
          </div>
          <div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/30">
            Solana slot: {health.slot.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <MetricBox label="Processing" value={overview.processing.toLocaleString()} />
        <MetricBox label="Failed" value={overview.failed.toLocaleString()} />
        <MetricBox
          label="Treasury SOL"
          value={health.treasury.sol.toLocaleString("en-US", { maximumFractionDigits: 9 })}
        />
      </div>

      <VisitorAnalytics />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
      <p className="text-xs text-white/30">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function HealthRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
      <span className="text-sm text-white/55">{label}</span>
      <span className={ok ? "text-xs font-black text-green-400" : "text-xs font-black text-red-400"}>
        {ok ? "● ONLINE" : "● ERROR"}
      </span>
    </div>
  );
}
