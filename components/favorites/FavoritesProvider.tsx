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
import type { CatalogProduct } from "@/lib/catalog";
import { useCatalog } from "@/components/catalog/CatalogProvider";

export const FAVORITES_STORAGE_KEY = "terranova-favorites-v1";

type FavoritesContextValue = {
  favorites: string[];
  favoriteProducts: CatalogProduct[];
  count: number;
  isHydrated: boolean;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function sanitizeFavorites(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const unique = new Set<string>();
  for (const slug of input) {
    if (typeof slug === "string" && slug.trim()) unique.add(slug);
  }
  return Array.from(unique);
}

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? sanitizeFavorites(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function persistFavorites(favorites: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore unavailable storage.
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { bySlug, isLoaded: catalogLoaded } = useCatalog();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setIsHydrated(true);

    function onStorage(event: StorageEvent) {
      if (event.key === FAVORITES_STORAGE_KEY) {
        try {
          setFavorites(
            event.newValue ? sanitizeFavorites(JSON.parse(event.newValue)) : [],
          );
        } catch {
          setFavorites([]);
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback(
    (slug: string) => {
      if (!bySlug.has(slug)) return;
      setFavorites((previous) => {
        const next = previous.includes(slug)
          ? previous.filter((item) => item !== slug)
          : [...previous, slug];
        persistFavorites(next);
        return next;
      });
    },
    [bySlug],
  );

  const removeFavorite = useCallback((slug: string) => {
    setFavorites((previous) => {
      const next = previous.filter((item) => item !== slug);
      persistFavorites(next);
      return next;
    });
  }, []);

  const favoriteProducts = useMemo(
    () =>
      favorites
        .map((slug) => bySlug.get(slug))
        .filter((product): product is CatalogProduct => Boolean(product)),
    [favorites, bySlug],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteProducts,
      count: catalogLoaded ? favoriteProducts.length : 0,
      isHydrated,
      isFavorite: (slug: string) => favorites.includes(slug),
      toggleFavorite,
      removeFavorite,
    }),
    [
      favorites,
      favoriteProducts,
      catalogLoaded,
      isHydrated,
      toggleFavorite,
      removeFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
