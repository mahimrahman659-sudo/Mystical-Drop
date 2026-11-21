"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type ClientAuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
};

export type ClientSession = {
  user: ClientAuthUser;
  session: {
    id: string;
    expiresAt: string | Date;
  };
};
