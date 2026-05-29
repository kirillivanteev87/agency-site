import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/site-data";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const numericId = Number(id);
  const project = await getProjectById(numericId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}
