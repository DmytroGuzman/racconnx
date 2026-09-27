"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  active: boolean;
  rcxPerSol: number;
  minPurchaseSol: number;
  maxPurchaseSol: number;
  updatedAt: string | null;
};

export default function SaleControl() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sale", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/admin/login");
          return null;
        }

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "Load failed");
        }

        return data.settings as Settings;
      })
      .then((value) => value && setSettings(value))
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Помилка."
        )
      );
  }, [router]);

  const pricePerRcx = useMemo(() => {
    if (!settings?.rcxPerSol) return 0;
    return 1 / settings.rcxPerSol;
  }, [settings]);

  async function save() {
    if (!settings) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/sale", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ??
            "Не вдалося зберегти налаштування."
        );
      }

      setSettings(data.settings);
      setMessage("Налаштування збережено.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Помилка."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="px-4 py-6 text-white/40 sm:p-8">
        {error || "Завантаження..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
          Sale Control
        </p>

        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
          Продаж RCX
        </h1>

        <p className="mt-2 text-sm leading-5 text-white/40 sm:text-base">
          Параметри зберігаються в Neon. Секретні
          ключі тут не зберігаються.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:mt-8 sm:p-6">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          <div className="min-w-0">
            <p className="font-black">
              Sale status
            </p>

            <p className="mt-1 text-sm text-white/35">
              {settings.active
                ? "Покупки дозволені"
                : "Продаж призупинено"}
            </p>
          </div>

          <button
            onClick={() =>
              setSettings({
                ...settings,
                active: !settings.active,
              })
            }
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-black sm:px-5 sm:text-sm ${
              settings.active
                ? "border border-green-400/30 bg-green-400/10 text-green-400"
                : "border border-red-400/30 bg-red-400/10 text-red-300"
            }`}
          >
            {settings.active
              ? "● ACTIVE"
              : "● PAUSED"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
            RCX per 1 SOL
          </span>

          <input
            type="number"
            min="1"
            step="1"
            value={settings.rcxPerSol}
            onChange={(e) =>
              setSettings({
                ...settings,
                rcxPerSol: Number(e.target.value),
              })
            }
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-lg font-black outline-none focus:border-purple-400/40 sm:mt-4 sm:py-4 sm:text-xl"
          />

          <p className="mt-3 break-words text-sm text-white/35">
            1 RCX ={" "}
            {pricePerRcx.toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 12,
              }
            )}{" "}
            SOL
          </p>
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
            Приклад
          </p>

          <p className="mt-3 break-words text-xl font-black sm:mt-4 sm:text-2xl">
            1 SOL →{" "}
            {settings.rcxPerSol.toLocaleString(
              "en-US"
            )}{" "}
            RCX
          </p>

          <p className="mt-3 break-words text-sm text-white/35">
            0.001 SOL →{" "}
            {(
              settings.rcxPerSol * 0.001
            ).toLocaleString("en-US")}{" "}
            RCX
          </p>
        </div>

        <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
            Minimum purchase, SOL
          </span>

          <input
            type="number"
            min="0.000000001"
            step="0.001"
            value={settings.minPurchaseSol}
            onChange={(e) =>
              setSettings({
                ...settings,
                minPurchaseSol: Number(
                  e.target.value
                ),
              })
            }
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-lg font-black outline-none focus:border-green-400/40 sm:mt-4 sm:py-4 sm:text-xl"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
            Maximum purchase, SOL
          </span>

          <input
            type="number"
            min="0.000000001"
            step="0.1"
            value={settings.maxPurchaseSol}
            onChange={(e) =>
              setSettings({
                ...settings,
                maxPurchaseSol: Number(
                  e.target.value
                ),
              })
            }
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-lg font-black outline-none focus:border-green-400/40 sm:mt-4 sm:py-4 sm:text-xl"
          />
        </label>
      </div>

      {error && (
        <p className="mt-5 text-sm text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-5 text-sm text-green-400">
          {message}
        </p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-green-400 px-6 py-4 font-black text-black disabled:opacity-50"
      >
        {saving
          ? "Збереження..."
          : "Save changes"}
      </button>

      {settings.updatedAt && (
        <p className="mt-4 text-center text-xs text-white/25">
          Остання зміна:{" "}
          {new Date(
            settings.updatedAt
          ).toLocaleString()}
        </p>
      )}
    </div>
  );
}
