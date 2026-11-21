"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { GoogleIcon } from "@/components/ui/icons";

export function ConnectGoogleButton({
  connected,
  enabled,
}: {
  connected: boolean;
  enabled: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (connected) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-on-secondary-container">
        <GoogleIcon size={14} />
        Google connected
      </span>
    );
  }

  if (!enabled) {
    return (
      <p className="text-body-sm leading-relaxed text-on-surface-variant">
        Google sign-in is not configured on this server. Password sign-in
        remains available.
      </p>
    );
  }

  async function connect() {
    setPending(true);
    setError(null);
    try {
      const { error: linkError } = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/account?linked=google",
      });
      if (linkError) {
        setError("Google could not be connected. Please try again.");
        setPending(false);
      }
    } catch {
      setError("Google could not be connected. Please try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={connect}
        disabled={pending}
        className="btn btn-outline disabled:cursor-wait disabled:opacity-70"
      >
        <GoogleIcon size={16} />
        {pending ? "Connecting…" : "Connect Google"}
      </button>
      {error ? <p className="mt-1 text-label-sm text-error">{error}</p> : null}
    </div>
  );
}
