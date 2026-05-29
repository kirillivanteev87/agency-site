import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { ContentEditor } from "./ContentEditor";

export default async function ContentEditorPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <ContentEditor />;
}
