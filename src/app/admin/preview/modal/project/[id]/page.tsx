import { redirect } from "next/navigation";
import { ProjectModalBody } from "@/components/ProjectModalBody";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminModalPreviewFrame } from "../../PreviewFrame";

export default async function AdminProjectModalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId) || projectId < 1) redirect("/admin/modals");

  return (
    <AdminModalPreviewFrame title="Предпросмотр модалки проекта">
      <ProjectModalBody projectId={projectId} />
    </AdminModalPreviewFrame>
  );
}
