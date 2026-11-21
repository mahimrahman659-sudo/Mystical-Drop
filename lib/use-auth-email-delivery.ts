"use client";

import { useEffect, useState } from "react";

export type AuthEmailDeliveryState = "checking" | "available" | "unavailable";

export async function checkAuthEmailDelivery(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth-delivery", { cache: "no-store" });
    if (!response.ok) return false;
    const body = (await response.json()) as { available?: unknown };
    return body.available === true;
  } catch {
    return false;
  }
}

export function useAuthEmailDelivery(): AuthEmailDeliveryState {
  const [state, setState] = useState<AuthEmailDeliveryState>("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth-delivery", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return false;
        const body = (await response.json()) as { available?: unknown };
        return body.available === true;
      })
      .then((available) => setState(available ? "available" : "unavailable"))
      .catch(() => {
        if (!controller.signal.aborted) setState("unavailable");
      });

    return () => controller.abort();
  }, []);

  return state;
}
