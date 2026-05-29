import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

type Resource =
  | "projects"
  | "case-studies"
  | "services"
  | "faqs"
  | "hero-features"
  | "marketplace-apps"
  | "submissions";

const models: Record<Resource, keyof typeof prisma> = {
  projects: "project",
  "case-studies": "caseStudy",
  services: "service",
  faqs: "faq",
  "hero-features": "heroFeature",
  "marketplace-apps": "marketplaceApp",
  submissions: "contactSubmission",
};

function revalidateForResource(key: Resource, id?: string) {
  revalidatePath("/");
  if (key === "marketplace-apps") revalidatePath("/marketplace");
  if (key === "projects" && id) revalidatePath(`/projects/${id}`);
  if (key === "case-studies" && id) revalidatePath(`/cases/${id}`);
}

function stripId(data: Record<string, unknown>) {
  const { id: _id, ...rest } = data;
  return rest;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { resource, id } = await params;
  const key = resource as Resource;
  const model = models[key];
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = (await request.json()) as Record<string, unknown>;
  const data = stripId(raw);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = await (prisma[model] as any).update({
    where: { id: Number(id) },
    data,
  });

  revalidateForResource(key, id);
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { resource, id } = await params;
  const key = resource as Resource;
  const model = models[key];
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma[model] as any).delete({ where: { id: Number(id) } });
  revalidateForResource(key, id);
  return NextResponse.json({ ok: true });
}
