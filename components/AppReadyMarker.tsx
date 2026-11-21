"use client";

import { useEffect } from "react";

export function AppReadyMarker() {
  useEffect(() => {
    document.documentElement.dataset.appReady = "true";
    return () => {
      delete document.documentElement.dataset.appReady;
    };
  }, []);

  return null;
}
