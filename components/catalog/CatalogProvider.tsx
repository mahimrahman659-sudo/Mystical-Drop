"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { CatalogProduct } from "@/lib/catalog";

type CatalogContextValue = {
  products: CatalogProduct[];
  bySlug: Map<string, CatalogProduct>;
  isLoaded: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("catalog");
      const data = (await response.json()) as { products?: CatalogProduct[] };
      setProducts(Array.isArray(data.products) ? data.products : []);
      setError(null);
    } catch {
      setProducts([]);
      setError("The catalog could not be loaded. Please refresh the page.");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === "terranova-catalog-refresh") void refresh();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const bySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({ products, bySlug, isLoaded, error, refresh }),
    [products, bySlug, isLoaded, error, refresh],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}
