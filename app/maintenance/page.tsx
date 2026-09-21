import { neon } from "@neondatabase/serverless";
import { getMaintenanceSettings } from "@/lib/maintenanceSettings";
import MaintenanceWatcher from "@/components/MaintenanceWatcher";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  let message = "We're upgrading RaccoonX. We'll be back soon.";

  try {
    const url = process.env.DATABASE_URL;
    if (url) {
      const settings = await getMaintenanceSettings(neon(url));
      message = settings.message;
    }
  } catch (error) {
    console.error("MAINTENANCE PAGE ERROR:", error);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030407] px-6 text-white">
      <MaintenanceWatcher />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-purple-600/20 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-emerald-400/10 blur-[160px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <section className="relative z-10 w-full max-w-2xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,.8)]" />
          System Maintenance
        </div>

        <h1 className="mt-8 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
          Raccoon<span className="text-purple-400">X</span>
        </h1>

        <p className="mt-5 text-2xl font-black uppercase tracking-tight sm:text-3xl">
          The raccoon is busy.
        </p>

        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/50 sm:text-lg">
          {message}
        </p>

        <div className="mx-auto mt-10 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-xl">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-sm font-bold text-white/60">
            Maintenance in progress
          </span>
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-white/20">
          No Trash. Just Gains.
        </p>
      </section>
    </main>
  );
}
