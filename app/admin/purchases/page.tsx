import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import PurchasesPage from "@/components/admin/PurchasesPage";

export default async function AdminPurchasesPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <AdminShell>
      <PurchasesPage />
    </AdminShell>
  );
}
