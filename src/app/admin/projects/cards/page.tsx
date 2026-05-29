import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { ProjectsContentEditor } from "../ProjectsContentEditor";

export default async function AdminProjectCardsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <ProjectsContentEditor mode="card" />;
}
