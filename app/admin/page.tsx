import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import AdminV3Dashboard from "@/components/admin/AdminV3Dashboard";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell>
      <AdminV3Dashboard />
    </AdminShell>
  );
}
