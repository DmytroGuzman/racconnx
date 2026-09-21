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

type Purchase = {
  id: number;
  paymentSignature: string;
  buyerWallet: string;
  sol: number;
  rcx: number;
  status: string;
  rcxSignature: string | null;
  createdAt: string;
};

const short = (value: string) =>
  `${value.slice(0, 5)}...${value.slice(-5)}`;

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [overviewResponse, purchasesResponse] = await Promise.all([
          fetch("/api/admin/overview", { cache: "no-store" }),
          fetch("/api/admin/purchases", { cache: "no-store" }),
        ]);

        if (overviewResponse.status === 401 || purchasesResponse.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const overview = await overviewResponse.json();
        const purchaseData = await purchasesResponse.json();

        if (!overviewResponse.ok || !overview.ok) {
          throw new Error(overview.error ?? "Overview error");
        }

        if (!purchasesResponse.ok || !purchaseData.ok) {
          throw new Error(purchaseData.error ?? "Purchases error");
        }

        setStats(overview.stats);
        setPurchases(purchaseData.purchases);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка завантаження.");
      }
    }

    load();
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const cards = stats
    ? [
        ["Продажі", stats.delivered.toLocaleString()],
        ["Отримано SOL", stats.solReceived.toLocaleString("en-US", { maximumFractionDigits: 9 })],
        ["Продано RCX", stats.rcxSold.toLocaleString("en-US", { maximumFractionDigits: 9 })],
        ["Покупці", stats.uniqueBuyers.toLocaleString()],
        ["Processing", stats.processing.toLocaleString()],
        ["Failed", stats.failed.toLocaleString()],
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <header className="border-b border-white/10 bg-black/20 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">
              RaccoonX
            </p>
            <h1 className="mt-1 text-xl font-black">Admin Dashboard</h1>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Вийти
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Overview</h2>
          <p className="mt-2 text-white/40">
            Статистика продажів RCX у реальному часі з Neon.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!stats ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white/40">
            Завантаження...
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                    {label}
                  </p>
                  <p className="mt-3 text-3xl font-black">{value}</p>
                </div>
              ))}
            </section>

            <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 px-6 py-5">
                <h3 className="text-lg font-black">Останні покупки</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-white/35">
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4">Wallet</th>
                      <th className="px-6 py-4">SOL</th>
                      <th className="px-6 py-4">RCX</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">RCX Tx</th>
                    </tr>
                  </thead>

                  <tbody>
                    {purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        className="border-b border-white/[0.06] last:border-0"
                      >
                        <td className="px-6 py-4 font-mono text-white/70">
                          {short(purchase.buyerWallet)}
                        </td>
                        <td className="px-6 py-4">{purchase.sol}</td>
                        <td className="px-6 py-4">
                          {purchase.rcx.toLocaleString("en-US")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full border border-green-400/20 bg-green-400/5 px-3 py-1 text-xs font-bold uppercase text-green-400">
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://solscan.io/tx/${purchase.paymentSignature}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-400 hover:underline"
                          >
                            {short(purchase.paymentSignature)}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          {purchase.rcxSignature ? (
                            <a
                              href={`https://solscan.io/tx/${purchase.rcxSignature}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-400 hover:underline"
                            >
                              {short(purchase.rcxSignature)}
                            </a>
                          ) : (
                            <span className="text-white/25">—</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {purchases.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-white/30">
                          Покупок поки немає.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
