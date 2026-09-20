import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminShell from "@/components/admin/AdminShell";
import ManualReview from "@/components/admin/ManualReview";

export default async function AdminReviewPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminShell><ManualReview /></AdminShell>;
}
