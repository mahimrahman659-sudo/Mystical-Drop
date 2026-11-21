"use client";

import type { ReactNode } from "react";
import { AppReadyMarker } from "@/components/AppReadyMarker";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartToast } from "@/components/cart/CartToast";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CatalogProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
          <CartToast />
          <AppReadyMarker />
        </FavoritesProvider>
      </CartProvider>
    </CatalogProvider>
  );
}
