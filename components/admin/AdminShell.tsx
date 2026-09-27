"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const desktopLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/purchases", label: "Purchases" },
  { href: "/admin/review", label: "Manual Review" },
  { href: "/admin/sale", label: "Sale" },
  { href: "/admin/settings", label: "Settings" },
];

const mobileLinks = [
  {
    href: "/admin",
    label: "Home",
    icon: HomeIcon,
  },
  {
    href: "/admin/purchases",
    label: "Purchases",
    icon: PurchasesIcon,
  },
  {
    href: "/admin/sale",
    label: "Sale",
    icon: SaleIcon,
  },
  {
    href: "/admin/settings",
    label: "More",
    icon: MoreIcon,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  if (href === "/admin/settings") {
    return (
      pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/review")
    );
  }

  return pathname.startsWith(href);
}

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">

        {/* DESKTOP SIDEBAR */}

        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/20 p-5 lg:block">
          <div className="px-3 py-4">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-green-400">
              RaccoonX
            </p>

            <p className="mt-2 text-lg font-black">
              Admin Panel
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {desktopLinks.map((item) => {
              const active = isActive(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Link
              href="/"
              target="_blank"
              className="block rounded-xl px-4 py-3 text-sm font-bold text-purple-400 hover:bg-white/[0.04]"
            >
              View Website ↗
            </Link>

            <button
              onClick={logout}
              className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-300/70 hover:bg-red-400/[0.06] hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* APP */}

        <div className="min-w-0 flex-1">

          {/* MOBILE HEADER */}

          <header
            className="
              sticky top-0 z-40
              border-b border-white/[0.07]
              bg-[#05070b]/90
              px-5 pb-3
              backdrop-blur-xl
              lg:hidden
            "
            style={{
              paddingTop:
                "max(12px, env(safe-area-inset-top))",
            }}
          >
            <div className="flex items-center justify-between">
              <Link href="/admin">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
                  RaccoonX
                </p>

                <p className="text-base font-black">
                  Admin
                </p>
              </Link>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />

                <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                  Live
                </span>
              </div>
            </div>
          </header>

          {/* PAGE */}

          <div
            className="
              pb-[calc(92px+env(safe-area-inset-bottom))]
              lg:pb-0
            "
          >
            {children}
          </div>

          {/* MOBILE TAB BAR */}

          <nav
            className="
              fixed inset-x-0 bottom-0 z-50
              border-t border-white/[0.08]
              bg-[#080a0f]/95
              backdrop-blur-2xl
              lg:hidden
            "
            style={{
              paddingBottom:
                "env(safe-area-inset-bottom)",
            }}
          >
            <div className="mx-auto grid h-[68px] max-w-lg grid-cols-4">
              {mobileLinks.map((item) => {
                const active = isActive(
                  pathname,
                  item.href
                );

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center gap-1 transition ${
                      active
                        ? "text-green-400"
                        : "text-white/35"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-0 h-[2px] w-8 rounded-full bg-green-400" />
                    )}

                    <Icon />

                    <span className="text-[10px] font-bold">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}

function HomeIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function PurchasesIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </svg>
  );
}

function SaleIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
      <path d="M12 6v2" />
      <path d="M12 16v2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}
