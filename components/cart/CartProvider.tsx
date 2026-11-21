"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addLine,
  cartTotals,
  CART_STORAGE_KEY,
  clearPersistedCart,
  filterAvailableLines,
  loadCart,
  MAX_QUANTITY_PER_ITEM,
  persistCart,
  readStoredCart,
  setLineQuantity,
  type CartLine,
  type DetailedCartLine,
} from "@/lib/cart";
import { useCatalog } from "@/components/catalog/CatalogProvider";

type CartToastState = {
  id: number;
  title: string;
  description: string;
};

type AddOptions = {
  announce?: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  items: DetailedCartLine[];
  quantity: number;
  subtotal: number;
  shipping: number;
  total: number;
  isHydrated: boolean;
  catalogError: string | null;
  toast: CartToastState | null;
  dismissToast: () => void;
  addItem: (slug: string, quantity?: number, options?: AddOptions) => void;
  changeQuantity: (slug: string, delta: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, bySlug, isLoaded: catalogLoaded, error: catalogError } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [toast, setToast] = useState<CartToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLines(loadCart());
    setStorageLoaded(true);

    function onStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) {
        setLines(readStoredCart(event.newValue));
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((title: string, description: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), title, description });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 6000);
  }, []);

  const commit = useCallback((next: CartLine[]) => {
    persistCart(next);
    setLines(next);
    return next;
  }, []);

  const addItem = useCallback(
    (slug: string, quantity = 1, options: AddOptions = {}) => {
      const product = bySlug.get(slug);
      setLines((previous) => {
        const next = addLine(previous, slug, quantity);
        persistCart(next);
        return next;
      });
      if (options.announce !== false) {
        showToast(
          product ? `${product.shortName} added to cart` : "Added to cart",
          quantity > 1
            ? `${quantity} fountains are waiting in your cart.`
            : "Your fountain is waiting in the cart.",
        );
      }
    },
    [bySlug, showToast],
  );

  const changeQuantity = useCallback(
    (slug: string, delta: number) => {
      setLines((previous) => {
        const current = previous.find((line) => line.slug === slug);
        if (!current) return previous;
        const quantity = Math.min(
          MAX_QUANTITY_PER_ITEM,
          Math.max(1, current.quantity + delta),
        );
        return commit(setLineQuantity(previous, slug, quantity));
      });
    },
    [commit],
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      setLines((previous) => {
        if (quantity <= 0 || !Number.isFinite(quantity)) {
          const next = previous.filter((line) => line.slug !== slug);
          persistCart(next);
          return next;
        }
        return commit(setLineQuantity(previous, slug, quantity));
      });
    },
    [commit],
  );

  const removeItem = useCallback((slug: string) => {
    setLines((previous) => {
      const next = previous.filter((line) => line.slug !== slug);
      persistCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    clearPersistedCart();
    setLines([]);
  }, []);

  const visibleLines = useMemo(
    () => (catalogLoaded ? filterAvailableLines(lines, products) : []),
    [catalogLoaded, lines, products],
  );
  const totals = useMemo(
    () => cartTotals(visibleLines, products),
    [visibleLines, products],
  );
  const isHydrated = storageLoaded && catalogLoaded;

  const value = useMemo<CartContextValue>(
    () => ({
      lines: visibleLines,
      items: totals.items,
      quantity: totals.quantity,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      isHydrated,
      catalogError,
      toast,
      dismissToast,
      addItem,
      changeQuantity,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      visibleLines,
      totals,
      isHydrated,
      catalogError,
      toast,
      dismissToast,
      addItem,
      changeQuantity,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
