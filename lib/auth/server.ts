import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { getDb } from "@/lib/db/client";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email";

function createAuth() {
  const baseURL = getBaseUrl();
  const google = googleIsConfigured();

  return betterAuth({
    appName: "TerraNova",
    baseURL,
    secret: getSecret(),
    database: mongodbAdapter(getDb()),
    trustedOrigins: [baseURL, "http://localhost:3000", "http://127.0.0.1:3000"],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        void sendPasswordResetEmail(user.email, url).catch(() => {
          // Email failures are not surfaced with account details.
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      expiresIn: 60 * 60,
      sendVerificationEmail: async ({ user, url }) => {
        void sendVerificationEmail(user.email, url).catch(() => {
          // The customer can request another verification email.
        });
      },
    },
    socialProviders: google
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
            prompt: "select_account",
          },
        }
      : {},
    account: {
      accountLinking: {
        disableImplicitLinking: true,
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: false,
        },
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 20 },
        "/sign-up/email": { window: 60, max: 30 },
        "/request-password-reset": { window: 60, max: 10 },
        "/send-verification-email": { window: 60, max: 10 },
        "/reset-password": { window: 60, max: 10 },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const name = user.name?.trim();
            if (!name || name.length < 2 || name.length > 80) {
              throw new APIError("BAD_REQUEST", {
                message: "Please enter a valid full name between 2 and 80 characters.",
              });
            }
            return {
              data: {
                ...user,
                name,
                role: "customer",
              },
            };
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type AuthInstance = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as {
  __terranovaAuth?: AuthInstance;
};

export function googleIsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function getBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not configured. Add it to .env.local using .env.example as a template.",
    );
  }
  return secret;
}

export function getAuth(): AuthInstance {
  if (globalForAuth.__terranovaAuth) return globalForAuth.__terranovaAuth;
  globalForAuth.__terranovaAuth = createAuth();
  return globalForAuth.__terranovaAuth;
}
