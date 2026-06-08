import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { formatStalePrismaError } from "@/lib/prisma-stale";

type Resource =
  | "projects"
  | "case-studies"
  | "services"
  | "faqs"
  | "pricing-plans"
  | "hero-features"
  | "marketplace-apps"
  | "submissions";

const models: Record<Resource, keyof typeof prisma> = {
  projects: "project",
  "case-studies": "caseStudy",
  services: "service",
  faqs: "faq",
  "pricing-plans": "pricingPlan",
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

function formatPrismaError(e: unknown): string {
  const raw = e instanceof Error ? e.message : "Ошибка сервера";
  const stale = formatStalePrismaError(raw);
  if (stale) return stale;
  return raw.length > 400 ? `${raw.slice(0, 400)}…` : raw;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const { resource, id } = await params;
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
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
  } catch (e) {
    console.error(`[admin PUT ${resource}/${id}]`, e);
    return NextResponse.json({ error: formatPrismaError(e) }, { status: 500 });
  }
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
