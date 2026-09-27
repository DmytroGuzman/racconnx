"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  enabled: boolean;
  message: string;
  updatedAt: string | null;
};

export default function MaintenanceControl() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<Settings | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    fetch(
      "/api/admin/maintenance",
      {
        cache: "no-store",
      }
    )
      .then(async (response) => {
        if (
          response.status === 401
        ) {
          router.replace(
            "/admin/login"
          );

          return null;
        }

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.error ??
              "Не вдалося завантажити налаштування."
          );
        }

        return data.settings as Settings;
      })
      .then(
        (value) =>
          value &&
          setSettings(value)
      )
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Помилка."
        )
      );
  }, [router]);

  async function save() {
    if (!settings) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/maintenance",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                settings
              ),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ??
            "Не вдалося зберегти налаштування."
        );
      }

      setSettings(
        data.settings
      );

      setMessage(
        data.settings.enabled
          ? "Maintenance Mode увімкнено. Публічний сайт закрито."
          : "Maintenance Mode вимкнено. Сайт знову доступний."
      );
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
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/40 sm:mt-8 sm:p-6">
        {error ||
          "Завантаження Maintenance Mode..."}
      </div>
    );
  }

  return (
    <section className="mt-6 min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:mt-8 sm:p-6">

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-400 sm:text-xs sm:tracking-[0.2em]">
            Website Control
          </p>

          <h2 className="mt-2 text-xl font-black">
            Maintenance Mode
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Коли режим увімкнений,
            відвідувачі бачать сторінку
            технічних робіт.
            Адмін-панель залишається
            доступною, а нові покупки
            RCX блокуються.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSettings({
              ...settings,
              enabled:
                !settings.enabled,
            })
          }
          className={`self-start shrink-0 rounded-full border px-5 py-2 text-xs font-black sm:self-auto sm:text-sm ${
            settings.enabled
              ? "border-red-400/30 bg-red-400/10 text-red-300"
              : "border-green-400/30 bg-green-400/10 text-green-400"
          }`}
        >
          {settings.enabled
            ? "● MAINTENANCE"
            : "● ONLINE"}
        </button>

      </div>

      <label className="mt-6 block">

        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 sm:text-xs sm:tracking-[0.16em]">
          Повідомлення для відвідувачів
        </span>

        <textarea
          value={
            settings.message
          }
          maxLength={500}
          rows={4}
          onChange={(event) =>
            setSettings({
              ...settings,
              message:
                event.target.value,
            })
          }
          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm leading-6 text-white outline-none focus:border-purple-400/40"
        />

        <div className="mt-2 text-right text-xs text-white/25">
          {
            settings.message
              .length
          }
          /500
        </div>

      </label>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-green-400/20 bg-green-400/[0.05] p-3 text-sm text-green-300">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-purple-500 to-green-400 px-4 py-4 text-sm font-black text-black disabled:opacity-50 sm:px-6"
      >
        {saving
          ? "Збереження..."
          : "Save Maintenance Settings"}
      </button>

      {settings.updatedAt && (
        <p className="mt-4 text-center text-[11px] text-white/25 sm:text-xs">
          Остання зміна:{" "}
          {new Date(
            settings.updatedAt
          ).toLocaleString()}
        </p>
      )}

    </section>
  );
}
