"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { AccountMenu } from "@/components/header/AccountMenu";
import { FavoritesDrawer } from "@/components/header/FavoritesDrawer";
import { MobileMenu } from "@/components/header/MobileMenu";
import { SearchDialog } from "@/components/header/SearchDialog";
import {
  BagIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const navItems = [
  { href: "/", label: "Home", match: (pathname: string) => pathname === "/" },
  {
    href: "/#collection",
    label: "Our Fountains",
    match: (pathname: string) => pathname.startsWith("/products"),
  },
  {
    href: "/innovation",
    label: "Our Innovation",
    match: (pathname: string) => pathname.startsWith("/innovation"),
  },
  {
    href: "/about",
    label: "Our Story",
    match: (pathname: string) => pathname.startsWith("/about"),
  },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { quantity, isHydrated } = useCart();
  const { count } = useFavorites();
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSearchOpen(false);
    setFavoritesOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/90 shadow-[0_1px_8px_rgba(41,45,39,0.04)] backdrop-blur-xl">
      <div className="site-container flex h-[68px] items-center justify-between gap-3 sm:h-20">
        <Link
          href="/"
          className="group flex shrink-0 flex-col"
          aria-label={`${BRAND_NAME} — return to homepage`}
        >
          <span className="whitespace-nowrap font-display text-[19px] leading-none tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-headline-md">
            {BRAND_NAME}
          </span>
          <span className="mt-1 text-[8px] uppercase leading-none tracking-[0.15em] text-on-surface-variant sm:text-label-sm sm:tracking-[0.13em]">
            {BRAND_TAGLINE}
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-3 lg:flex lg:gap-space-lg">
          {navItems.map((item) => {
            const active = item.match?.(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap text-label-lg transition-colors hover:text-on-surface ${
                  active ? "font-medium text-primary" : "text-on-surface-variant"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search fountains"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className="icon-button hidden md:inline-flex"
          >
            <SearchIcon size={20} />
          </button>
          <button
            type="button"
            onClick={() => setFavoritesOpen(true)}
            aria-label={`Favorites, ${count} saved`}
            aria-haspopup="dialog"
            aria-expanded={favoritesOpen}
            className="icon-button relative hidden md:inline-flex"
          >
            <HeartIcon size={20} filled={count > 0} />
            {count > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-on-primary"
              >
                {count}
              </span>
            ) : null}
          </button>
          <AccountMenu />
          <Link
            href="/cart"
            aria-label={`Cart, ${isHydrated ? quantity : 0} ${
              quantity === 1 ? "item" : "items"
            }`}
            className="icon-button relative"
          >
            <BagIcon size={21} />
            <span
              aria-hidden="true"
              className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-on-primary sm:right-1 sm:top-1"
            >
              {isHydrated ? quantity : 0}
            </span>
          </Link>
          <span
            aria-hidden="true"
            title={`${BRAND_NAME} studio seal`}
            className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container font-display text-[10px] font-semibold tracking-tight text-primary xl:flex"
          >
            MD
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="icon-button lg:hidden"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FavoritesDrawer
        open={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
    </header>
  );
}
