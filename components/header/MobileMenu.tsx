"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { Dialog } from "@/components/ui/Dialog";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import {
  ArrowRightIcon,
  BagIcon,
  CloseIcon,
  HeartIcon,
  LogoutIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  onOpenFavorites: () => void;
  onOpenSearch: () => void;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#collection", label: "Our Fountains" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function MobileMenu({
  open,
  onClose,
  onOpenFavorites,
  onOpenSearch,
}: MobileMenuProps) {
  const { quantity } = useCart();
  const { count } = useFavorites();
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user as
    | { name?: string; email?: string; role?: string }
    | undefined;
  const isAdmin = user?.role === "admin";
  const returnTo = sanitizeReturnTo(pathname);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      setSigningOut(false);
      onClose();
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="mobile-menu-title"
      panelClassName="sm:max-w-md sm:rounded-xl sm:mx-auto"
    >
      <div className="flex items-start justify-between border-b border-outline-variant/30 px-5 py-5">
        <div>
          <p className="font-display text-headline-md tracking-tight text-on-surface">
            {BRAND_NAME}
          </p>
          <p className="mt-0.5 text-label-sm uppercase tracking-[0.18em] text-on-surface-variant">
            {BRAND_TAGLINE}
          </p>
          <h2 id="mobile-menu-title" className="sr-only">
            Site menu
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="icon-button -mr-1 -mt-1"
        >
          <CloseIcon size={20} />
        </button>
      </div>
      <nav aria-label="Mobile navigation" className="px-5 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex min-h-12 items-center justify-between rounded px-2 font-display text-[22px] text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                data-autofocus={item.label === "Home" ? true : undefined}
              >
                {item.label}
                <ArrowRightIcon size={16} className="text-outline" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-outline-variant/30 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-left text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <SearchIcon size={18} className="text-on-surface-variant" />
            Search fountains
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFavorites();
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-left text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <HeartIcon size={18} className="text-on-surface-variant" />
            Favorites
            <span className="ml-auto text-label-sm uppercase tracking-wider text-secondary">
              {count}
            </span>
          </button>
          <Link
            href="/cart"
            onClick={onClose}
            className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <BagIcon size={18} className="text-on-surface-variant" />
            Cart
            <span className="ml-auto text-label-sm uppercase tracking-wider text-secondary">
              {quantity}
            </span>
          </Link>
        </div>

        <div className="mt-4 border-t border-outline-variant/30 pt-4">
          {user ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <UserIcon size={18} className="text-on-surface-variant" />
                Account
                <span className="ml-auto max-w-[55%] truncate text-label-sm text-on-surface-variant">
                  {user.name}
                </span>
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-body-md text-primary transition-colors hover:bg-surface-container-low"
                >
                  <UserIcon size={18} />
                  Admin panel
                </Link>
              ) : null}
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-left text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-60"
              >
                <LogoutIcon size={18} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                onClick={onClose}
                className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <UserIcon size={18} className="text-on-surface-variant" />
                Sign in
              </Link>
              <Link
                href={`/register?returnTo=${encodeURIComponent(returnTo)}`}
                onClick={onClose}
                className="flex min-h-12 w-full items-center gap-3 rounded px-2 text-body-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <UserIcon size={18} className="text-on-surface-variant" />
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </Dialog>
  );
}
