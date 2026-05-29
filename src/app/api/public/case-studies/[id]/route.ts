import { NextResponse } from "next/server";
import { getCaseStudyWithMetrics } from "@/lib/site-data";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const data = await getCaseStudyWithMetrics(Number(id));
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...data,
    body: data.body ?? "",
    gallery: data.gallery ?? "[]",
  });
}
