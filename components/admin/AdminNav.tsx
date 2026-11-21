"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Site banner" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="w-full">
      <div className="flex flex-col gap-2 lg:block">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-0.5">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center justify-center rounded px-2 text-body-sm transition-colors lg:justify-start lg:px-3 ${
                  active
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/"
          className="flex min-h-10 items-center rounded px-3 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:mt-3 lg:border-t lg:border-outline-variant/30 lg:pt-3"
        >
          ← Back to store
        </Link>
      </div>
    </nav>
  );
}
