import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "agency_admin_session";

export async function verifyAdmin(username: string, password: string) {
  const { prisma } = await import("./prisma");
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function createSession() {
  const secret = process.env.SESSION_SECRET || "dev-secret";
  const token = Buffer.from(`${secret}:${Date.now()}`).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.SESSION_SECRET || "dev-secret";
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    return decoded.startsWith(`${secret}:`);
  } catch {
    return false;
  }
}

export { parseJsonArray } from "./parse-json";
