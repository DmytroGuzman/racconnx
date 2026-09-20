import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import SaleControl from "@/components/admin/SaleControl";

export default async function SalePage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell>
      <SaleControl />
    </AdminShell>
  );
}
