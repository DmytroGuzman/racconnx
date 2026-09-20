import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import MaintenanceControl from "@/components/admin/MaintenanceControl";

export default async function SettingsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="mt-2 text-white/40">
          Керування сайтом та системними налаштуваннями RACCOONX.
        </p>

        <MaintenanceControl />

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <p className="font-black">Security</p>
          <p className="mt-2 text-sm leading-6 text-white/40">
            SALE_WALLET_SECRET, DATABASE_URL та ADMIN_SESSION_SECRET навмисно не відображаються
            і не редагуються через браузер.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
