"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { LogoutIcon, UserIcon } from "@/components/ui/icons";

type SessionUserShape = {
  name?: string;
  email?: string;
  role?: string;
};

export function AccountMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const user = session?.user as SessionUserShape | undefined;
  const isAdmin = user?.role === "admin";
  const returnTo = /^\/(login|register|forgot-password|reset-password|verify-email|dev\/mailbox)/.test(
    pathname,
  )
    ? "/account"
    : pathname || "/account";

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      setOpen(false);
      setSigningOut(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={user ? `Account menu for ${user.name}` : "Account menu"}
        aria-expanded={open}
        aria-haspopup="true"
        className="icon-button relative"
      >
        <UserIcon size={20} />
        {user ? (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-secondary"
          />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-2 shadow-elevated">
          {isPending ? (
            <p className="px-3 py-2 text-body-sm text-on-surface-variant">
              Checking session…
            </p>
          ) : user ? (
            <>
              <div className="border-b border-outline-variant/30 px-3 pb-2 pt-1">
                <p className="truncate font-display text-[17px] text-on-surface">
                  {user.name}
                </p>
                <p className="truncate text-label-sm text-on-surface-variant">
                  {user.email}
                </p>
                {isAdmin ? (
                  <span className="mt-1 inline-flex rounded-full bg-secondary-container px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-on-secondary-container">
                    Admin
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col py-1">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex min-h-10 items-center rounded px-3 text-body-sm text-on-surface hover:bg-surface-container-low"
                >
                  Account
                </Link>
                <Link
                  href="/account#orders"
                  onClick={() => setOpen(false)}
                  className="flex min-h-10 items-center rounded px-3 text-body-sm text-on-surface hover:bg-surface-container-low"
                >
                  My orders
                </Link>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex min-h-10 items-center rounded px-3 text-body-sm text-primary hover:bg-surface-container-low"
                  >
                    Admin panel
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={signOut}
                  disabled={signingOut}
                  className="flex min-h-10 items-center gap-2 rounded px-3 text-left text-body-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface disabled:opacity-60"
                >
                  <LogoutIcon size={15} />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col py-1">
              <Link
                href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                onClick={() => setOpen(false)}
                className="flex min-h-10 items-center rounded px-3 text-body-sm text-on-surface hover:bg-surface-container-low"
              >
                Sign in
              </Link>
              <Link
                href={`/register?returnTo=${encodeURIComponent(returnTo)}`}
                onClick={() => setOpen(false)}
                className="flex min-h-10 items-center rounded px-3 text-body-sm text-on-surface hover:bg-surface-container-low"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
