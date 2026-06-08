import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { briefDocxFilename, buildBriefDocxBuffer } from "@/lib/brief-docx";
import { isBriefSubmission } from "@/lib/brief-submission";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 });
  }

  const submission = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  if (!isBriefSubmission(submission.message)) {
    return NextResponse.json(
      { error: "Эта заявка не является брифом" },
      { status: 400 },
    );
  }

  const createdAt = new Date(submission.createdAt);
  const buffer = await buildBriefDocxBuffer({
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    message: submission.message,
    createdAt,
  });

  const filename = briefDocxFilename(submission.name, createdAt);
  const encoded = encodeURIComponent(filename);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encoded}`,
    },
  });
}
