import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getAuth } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { sanitizeReturnTo } from "@/lib/auth/return-to";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "customer" | "admin";
  image: string | null;
  createdAt: string;
};

type UserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  emailVerified?: boolean;
  role?: string;
  image?: string | null;
  createdAt?: string | Date;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return null;

  const user = await getDb()
    .collection<UserDocument>("user")
    .findOne({ _id: new ObjectId(session.user.id) });

  if (!user) return null;

  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified === true,
    role: user.role === "admin" ? "admin" : "customer",
    image: user.image ?? null,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt ?? "",
  };
});

export async function requireUser(returnTo: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`);
  }
  return user;
}

export async function assertAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getLinkedProviderIds(userId: string): Promise<string[]> {
  const accounts = await getDb()
    .collection<{ userId: ObjectId; providerId: string }>("account")
    .find({ userId: new ObjectId(userId) })
    .project({ providerId: 1 })
    .toArray();
  return accounts.map((account) => account.providerId);
}

export async function hasGoogleAccount(userId: string): Promise<boolean> {
  const count = await getDb().collection("account").countDocuments({
    userId: new ObjectId(userId),
    providerId: "google",
  });
  return count > 0;
}
