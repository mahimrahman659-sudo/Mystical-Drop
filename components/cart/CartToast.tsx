"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { CheckCircleIcon, CloseIcon } from "@/components/ui/icons";

export function CartToast() {
  const { toast, dismissToast } = useCart();

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {toast ? `${toast.title}. ${toast.description}` : ""}
      </div>
      {toast ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6 sm:justify-end">
          <div className="toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg bg-inverse-surface p-4 text-inverse-on-surface shadow-elevated">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
              <CheckCircleIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-semibold leading-5">{toast.title}</p>
              <p className="mt-0.5 text-body-sm leading-5 text-inverse-on-surface/75">
                {toast.description}
              </p>
              <Link
                href="/cart"
                onClick={dismissToast}
                className="mt-2 inline-flex min-h-8 items-center text-label-sm font-semibold uppercase tracking-widest text-secondary-fixed underline decoration-secondary-fixed/40 underline-offset-4 hover:decoration-secondary-fixed"
              >
                View Cart
              </Link>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss cart notification"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-inverse-on-surface/70 transition-colors hover:bg-white/10 hover:text-inverse-on-surface"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
