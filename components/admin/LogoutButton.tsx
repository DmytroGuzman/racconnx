"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="flex w-full items-center justify-between rounded-2xl border border-red-400/15 bg-red-400/[0.035] p-4 text-left transition hover:bg-red-400/[0.07] disabled:opacity-50 sm:p-5"
    >
      <div>
        <p className="font-black text-red-300">
          {loading ? "Вихід..." : "Вийти з акаунта"}
        </p>

        <p className="mt-1 text-sm leading-5 text-white/35">
          Завершити поточну сесію адміністратора.
        </p>
      </div>

      <span className="shrink-0 text-xl text-red-300/50">
        ›
      </span>
    </button>
  );
}
