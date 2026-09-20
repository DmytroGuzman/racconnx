"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Purchase = {
  id: number;
  paymentSignature: string;
  buyerWallet: string;
  sol: number;
  rcx: number;
  status: string;
  rcxSignature: string | null;
  createdAt: string;
  updatedAt: string;
};

const short = (value: string) => `${value.slice(0, 6)}...${value.slice(-6)}`;

function statusClass(status: string) {
  if (status === "delivered") return "border-green-400/20 bg-green-400/[0.07] text-green-400";
  if (status === "processing") return "border-yellow-400/20 bg-yellow-400/[0.07] text-yellow-300";
  return "border-red-400/20 bg-red-400/[0.07] text-red-300";
}

export default function PurchasesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Purchase[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/purchases?limit=500", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error ?? "Load failed");
      setRows(data.purchases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === "all" || row.status === status;
      const matchesQuery = !q ||
        row.buyerWallet.toLowerCase().includes(q) ||
        row.paymentSignature.toLowerCase().includes(q) ||
        (row.rcxSignature ?? "").toLowerCase().includes(q) ||
        String(row.id) === q;
      return matchesStatus && matchesQuery;
    });
  }, [rows, query, status]);

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const header = ["id","date","updated","wallet","sol","rcx","status","payment_signature","rcx_signature"];
    const body = filtered.map((r) => [
      r.id, r.createdAt, r.updatedAt, r.buyerWallet, r.sol, r.rcx, r.status, r.paymentSignature, r.rcxSignature ?? ""
    ].map(esc).join(","));
    const blob = new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raccoonx-purchases-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-6 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black">Purchases</h1>
          <p className="mt-2 text-white/40">До 500 останніх записів із Neon.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/[0.05] disabled:opacity-40">
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
          <button onClick={exportCsv} disabled={filtered.length === 0}
            className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black disabled:opacity-40">
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="ID, wallet або transaction signature..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 outline-none" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-3">
          <option value="all">All statuses</option>
          <option value="delivered">Delivered</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-white/35">
        <span>Shown: {filtered.length}</span><span>Total loaded: {rows.length}</span>
      </div>
      {error && <p className="mt-5 text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="bg-white/[0.035] text-xs uppercase text-white/35">
            <tr>
              <th className="px-5 py-4">ID</th><th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Wallet</th><th className="px-5 py-4">SOL</th>
              <th className="px-5 py-4">RCX</th><th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Payment</th><th className="px-5 py-4">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                <td className="px-5 py-4 text-white/35">#{row.id}</td>
                <td className="px-5 py-4 text-white/45">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4 font-mono">
                  <a href={`https://solscan.io/account/${row.buyerWallet}`} target="_blank" rel="noreferrer"
                    className="hover:text-purple-400">{short(row.buyerWallet)}</a>
                </td>
                <td className="px-5 py-4">{row.sol.toLocaleString("en-US", { maximumFractionDigits: 9 })}</td>
                <td className="px-5 py-4">{row.rcx.toLocaleString("en-US")}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <a className="text-purple-400 hover:underline" target="_blank" rel="noreferrer"
                    href={`https://solscan.io/tx/${row.paymentSignature}`}>{short(row.paymentSignature)} ↗</a>
                </td>
                <td className="px-5 py-4">
                  {row.rcxSignature ? (
                    <a className="text-green-400 hover:underline" target="_blank" rel="noreferrer"
                      href={`https://solscan.io/tx/${row.rcxSignature}`}>{short(row.rcxSignature)} ↗</a>
                  ) : <span className="text-white/25">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <div className="p-10 text-center text-sm text-white/30">Нічого не знайдено.</div>}
      </div>
    </div>
  );
}
