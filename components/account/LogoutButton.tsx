"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { LogoutIcon } from "@/components/ui/icons";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await authClient.signOut();
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="btn btn-outline w-full sm:w-auto disabled:cursor-wait disabled:opacity-70"
    >
      <LogoutIcon size={16} />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
