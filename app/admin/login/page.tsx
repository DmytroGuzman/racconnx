import { redirect } from "next/navigation";
import AdminLogin from "@/components/admin/AdminLogin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return <AdminLogin />;
}
