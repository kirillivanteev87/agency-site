import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await prisma.contactSubmission.updateMany({
    where: { read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
