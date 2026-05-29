import { NextResponse } from "next/server";
import { createSession, verifyAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Введите логин и пароль" }, { status: 400 });
  }
  const valid = await verifyAdmin(username, password);
  if (!valid) {
    return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
