"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/purchases", label: "Purchases" },
  { href: "/admin/review", label: "Manual Review" },
  { href: "/admin/sale", label: "Sale" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/20 p-5 lg:block">
          <div className="px-3 py-4">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-green-400">RACCOONX</p>
            <p className="mt-2 text-lg font-black">Admin Panel</p>
          </div>

          <nav className="mt-6 space-y-2">
            {links.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-bold transition ${
                    active ? "bg-white/[0.08] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Link href="/" target="_blank"
              className="block rounded-xl px-4 py-3 text-sm font-bold text-purple-400 hover:bg-white/[0.04]">
              View Website ↗
            </Link>
            <button onClick={logout}
              className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-300/70 hover:bg-red-400/[0.06] hover:text-red-300">
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="font-black">RACCOONX Admin</Link>
              <button onClick={logout} className="text-sm text-white/50">Logout</button>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {links.map((item) => (
                <Link key={item.href} href={item.href}
                  className="whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/60">
                  {item.label}
                </Link>
              ))}
            </div>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
