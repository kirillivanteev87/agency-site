import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <AdminDashboard />;
}
