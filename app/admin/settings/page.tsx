import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import MaintenanceControl from "@/components/admin/MaintenanceControl";

export default async function SettingsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
            Administration
          </p>

          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            More
          </h1>

          <p className="mt-2 text-sm leading-5 text-white/40 sm:text-base">
            Додаткові інструменти та системні налаштування RaccoonX.
          </p>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/30 sm:text-xs">
            Management
          </p>

          <Link
            href="/admin/review"
            className="flex items-center justify-between gap-4 rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.035] p-4 transition hover:bg-yellow-400/[0.06] sm:p-5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">
                  ⚠
                </span>

                <p className="font-black">
                  Manual Review
                </p>
              </div>

              <p className="mt-1 text-sm leading-5 text-white/35">
                Перевірка processing та failed покупок.
              </p>
            </div>

            <span className="shrink-0 text-xl text-white/25">
              ›
            </span>
          </Link>
        </div>

        <MaintenanceControl />

        <div className="mt-6">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/30 sm:text-xs">
            Security
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-green-400/20 bg-green-400/[0.06] text-sm text-green-400">
                ✓
              </div>

              <div className="min-w-0">
                <p className="font-black">
                  Secrets protected
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-white/40">
                  SALE_WALLET_SECRET, DATABASE_URL та
                  ADMIN_SESSION_SECRET навмисно не
                  відображаються і не редагуються через браузер.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
