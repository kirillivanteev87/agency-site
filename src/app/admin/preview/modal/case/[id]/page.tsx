import { redirect } from "next/navigation";
import { CaseStudyModalBody } from "@/components/CaseStudyModalBody";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminModalPreviewFrame } from "../../PreviewFrame";

export default async function AdminCaseModalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const { id } = await params;
  const caseStudyId = Number(id);
  if (!Number.isFinite(caseStudyId) || caseStudyId < 1) redirect("/admin/modals");

  return (
    <AdminModalPreviewFrame title="Предпросмотр модалки кейса">
      <CaseStudyModalBody caseStudyId={caseStudyId} />
    </AdminModalPreviewFrame>
  );
}
