import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LayoutEditor } from "./LayoutEditor";

export default async function LayoutEditorPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <LayoutEditor />;
}
