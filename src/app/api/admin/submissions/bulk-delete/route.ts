import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
});

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный список id" }, { status: 400 });
  }

  const result = await prisma.contactSubmission.deleteMany({
    where: { id: { in: parsed.data.ids } },
  });

  return NextResponse.json({ ok: true, deleted: result.count });
}
