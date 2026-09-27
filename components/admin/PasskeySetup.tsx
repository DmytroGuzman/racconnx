"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";

export default function PasskeySetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function setupPasskey() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const optionsResponse = await fetch(
        "/api/admin/passkey/register/options",
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
            "Не вдалося почати налаштування Passkey."
        );
      }

      const registration =
        await startRegistration({
          optionsJSON:
            optionsData.options,
        });

      const verifyResponse = await fetch(
        "/api/admin/passkey/register/verify",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            registration
          ),
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

      setMessage(
        "Passkey успішно створено. Тепер цей пристрій можна використовувати для входу."
      );
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "NotAllowedError"
      ) {
        setError(
          "Створення Passkey було скасовано."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося створити Passkey."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/20 bg-purple-400/[0.07] text-lg">
          ◉
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-black">
            Face ID / Passkey
          </p>

          <p className="mt-1 text-sm leading-6 text-white/40">
            Додай Passkey для швидкого та безпечного входу в RCX Admin.
          </p>

          <button
            type="button"
            onClick={setupPasskey}
            disabled={loading}
            className="mt-4 w-full rounded-xl border border-purple-400/25 bg-purple-400/[0.08] px-4 py-3 text-sm font-black text-purple-300 transition hover:bg-purple-400/[0.12] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading
              ? "Налаштування..."
              : "Налаштувати Face ID"}
          </button>

          {message && (
            <p className="mt-3 text-sm leading-5 text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-3 text-sm leading-5 text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
