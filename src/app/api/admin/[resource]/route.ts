import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

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

export async function GET(_req: Request, { params }: { params: Promise<{ resource: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { resource } = await params;
  const key = resource as Resource;
  const model = models[key];
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = await (prisma[model] as any).findMany({
    orderBy: key === "submissions" ? { createdAt: "desc" } : { sortOrder: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { resource } = await params;
  const key = resource as Resource;
  const model = models[key];
  if (!model || key === "submissions") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const data = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = await (prisma[model] as any).create({ data });
  revalidatePath("/");
  if (key === "marketplace-apps") revalidatePath("/marketplace");
  if (key === "projects" && item?.id != null) {
    revalidatePath(`/projects/${item.id}`);
  }
  if (key === "case-studies" && item?.id != null) {
    revalidatePath(`/cases/${item.id}`);
  }
  return NextResponse.json(item, { status: 201 });
}
