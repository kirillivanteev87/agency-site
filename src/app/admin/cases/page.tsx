import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { CasesContentEditor } from "./CasesContentEditor";

export default async function AdminCasesPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <CasesContentEditor />;
}
