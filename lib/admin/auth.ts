import "server-only";

import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

export type AdminViewer =
  | { status: "signed-out" }
  | { status: "denied"; user: SessionUser }
  | { status: "admin"; user: SessionUser };

export async function getAdminViewer(): Promise<AdminViewer> {
  const user = await getSessionUser();
  if (!user) return { status: "signed-out" };
  if (user.role !== "admin") return { status: "denied", user };
  return { status: "admin", user };
}

export async function requireAdminAction(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?returnTo=%2Fadmin");
  }
  if (user.role !== "admin") {
    redirect("/admin");
  }
  return user;
}
