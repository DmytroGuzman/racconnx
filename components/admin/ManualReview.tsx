"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Purchase = {
  id: number; paymentSignature: string; buyerWallet: string; sol: number; rcx: number;
  status: string; rcxSignature: string | null; createdAt: string; updatedAt: string;
};

const short = (v: string) => `${v.slice(0, 7)}...${v.slice(-7)}`;

export default function ManualReview() {
  const router = useRouter();
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/purchases?mode=review&limit=500", { cache: "no-store" });
      if (r.status === 401) { router.replace("/admin/login"); return; }
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error ?? "Load failed");
      setRows(data.purchases);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка.");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="px-6 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">Attention queue</p>
          <h1 className="mt-2 text-3xl font-black">Manual Review</h1>
          <p className="mt-2 max-w-3xl text-white/40">
            Тут лише processing та failed. Панель навмисно не має кнопки повторної видачі RCX:
            спочатку перевіряй payment і delivery у Solscan, щоб не зробити подвійну виплату.
          </p>
        </div>
        <button onClick={() => void load()} disabled={loading}
          className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.05] disabled:opacity-40">
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      <div className="mt-8 grid gap-4">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/30">#{row.id}</span>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${
                    row.status === "processing"
                      ? "border-yellow-400/20 bg-yellow-400/[0.07] text-yellow-300"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-300"
                  }`}>{row.status}</span>
                </div>
                <p className="mt-4 font-mono text-sm">{short(row.buyerWallet)}</p>
                <p className="mt-2 text-sm text-white/45">
                  {row.sol.toLocaleString("en-US", { maximumFractionDigits: 9 })} SOL → {row.rcx.toLocaleString("en-US")} RCX
                </p>
                <p className="mt-2 text-xs text-white/25">
                  Created: {new Date(row.createdAt).toLocaleString()} · Updated: {new Date(row.updatedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap content-start gap-2">
                <a href={`https://solscan.io/tx/${row.paymentSignature}`} target="_blank" rel="noreferrer"
                  className="rounded-xl border border-purple-400/20 bg-purple-400/[0.06] px-4 py-3 text-xs font-bold text-purple-300">
                  Payment ↗
                </a>
                {row.rcxSignature && (
                  <a href={`https://solscan.io/tx/${row.rcxSignature}`} target="_blank" rel="noreferrer"
                    className="rounded-xl border border-green-400/20 bg-green-400/[0.06] px-4 py-3 text-xs font-bold text-green-300">
                    Delivery ↗
                  </a>
                )}
                <a href={`https://solscan.io/account/${row.buyerWallet}`} target="_blank" rel="noreferrer"
                  className="rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-white/55">
                  Wallet ↗
                </a>
              </div>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-green-400/15 bg-green-400/[0.04] p-10 text-center text-green-300">
            Черга порожня — processing/failed покупок немає.
          </div>
        )}
      </div>
    </div>
  );
}
