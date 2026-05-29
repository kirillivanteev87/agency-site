import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const count = await prisma.contactSubmission.count({ where: { read: false } });
  return NextResponse.json({ count });
}
