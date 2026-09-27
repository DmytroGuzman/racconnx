"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

export default function AdminLogin() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passkeyLoading, setPasskeyLoading] =
    useState(false);

  async function loginWithPasskey() {
    setError("");
    setPasskeyLoading(true);

    try {
      const optionsResponse = await fetch(
        "/api/admin/passkey/login/options",
        {
          method: "POST",
          cache: "no-store",
        }
      );

      const optionsData =
        await optionsResponse.json();

      if (
        !optionsResponse.ok ||
        !optionsData.ok
      ) {
        throw new Error(
          optionsData.error ??
            "Не вдалося почати вхід через Passkey."
        );
      }

      const authentication =
        await startAuthentication({
          optionsJSON: optionsData.options,
        });

      const verifyResponse = await fetch(
        "/api/admin/passkey/login/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(authentication),
        }
      );

      const verifyData =
        await verifyResponse.json();

      if (
        !verifyResponse.ok ||
        !verifyData.ok
      ) {
        throw new Error(
          verifyData.error ??
            "Не вдалося підтвердити Passkey."
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "NotAllowedError"
      ) {
        setError(
          "Вхід через Face ID / Passkey скасовано."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося увійти через Passkey."
        );
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setPasswordLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(
          data.error ??
            "Не вдалося увійти."
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError(
        "Помилка з'єднання."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  const busy =
    passwordLoading || passkeyLoading;

  return (
    <main className="min-h-screen bg-[#05070b] px-4 py-10 text-white sm:px-6 sm:py-20">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center">

        <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-8">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">
            RaccoonX
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Admin Panel
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Увійди, щоб керувати RaccoonX.
          </p>

          <button
            type="button"
            onClick={loginWithPasskey}
            disabled={busy}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-green-400/20 bg-green-400/[0.08] px-5 py-4 font-black text-green-400 transition hover:bg-green-400/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaceIdIcon />

            <span>
              {passkeyLoading
                ? "Перевірка..."
                : "Увійти через Face ID"}
            </span>
          </button>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/25">
              або
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit}>

            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Пароль
            </label>

            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={busy}
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 outline-none transition focus:border-green-400/40 disabled:opacity-50"
              placeholder="••••••••••••"
            />

            {error && (
              <p className="mt-4 text-sm leading-5 text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                busy || !password
              }
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-green-400 px-5 py-4 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {passwordLoading
                ? "Вхід..."
                : "Увійти"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}

function FaceIdIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8V6a2 2 0 0 1 2-2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />

      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
      <path d="M9 15c1.5 1 4.5 1 6 0" />
      <path d="M12 9v3" />
    </svg>
  );
}
