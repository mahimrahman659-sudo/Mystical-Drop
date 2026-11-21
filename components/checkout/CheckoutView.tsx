"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import {
  ArrowLeftIcon,
  CardIcon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
  LockIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import {
  CONFIRMATION_STORAGE_KEY,
  DISTRICT_SUGGESTIONS,
  EMPTY_CHECKOUT,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutValues,
} from "@/lib/checkout";
import { FREE_SHIPPING } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

const FIELD_IDS: Record<CheckoutField, string> = {
  fullName: "checkout-full-name",
  phone: "checkout-phone",
  email: "checkout-email",
  street: "checkout-street",
  city: "checkout-city",
  postalCode: "checkout-postal",
  instructions: "checkout-instructions",
};

const inputAutocomplete: Partial<Record<CheckoutField, string>> = {
  fullName: "name",
  phone: "tel",
  email: "email",
  street: "street-address",
  city: "address-level2",
  postalCode: "postal-code",
};

function CheckoutStepper() {
  return (
    <div className="w-full bg-surface-container-low/70 py-space-md">
      <div className="site-container">
        <nav
          aria-label="Checkout progress"
          className="mx-auto flex max-w-xl items-center justify-between"
        >
          <Link
            href="/cart"
            className="flex min-h-10 items-center gap-1.5 text-secondary transition-colors hover:text-primary"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-on-secondary">
              <CheckIcon size={14} />
            </span>
            <span className="text-[11px] uppercase tracking-wider sm:text-label-md sm:tracking-normal">
              <span className="hidden sm:inline">01. </span>Cart
            </span>
          </Link>
          <div aria-hidden="true" className="h-0.5 w-6 rounded-full bg-secondary/30 sm:w-20" />
          <div
            aria-current="step"
            className="flex min-h-10 items-center gap-1.5 text-primary"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-label-md text-on-primary">
              2
            </span>
            <span className="text-[11px] uppercase tracking-wider sm:text-label-md sm:tracking-normal">
              <span className="hidden sm:inline">02. </span>Delivery &amp; Payment
            </span>
          </div>
          <div aria-hidden="true" className="h-0.5 w-6 rounded-full bg-surface-container-highest sm:w-20" />
          <div className="flex min-h-10 items-center gap-1.5 text-on-surface-variant/60">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-label-md text-on-surface-variant">
              3
            </span>
            <span className="text-[11px] uppercase tracking-wider sm:text-label-md sm:tracking-normal">
              <span className="hidden sm:inline">03. </span>Placed
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
}

function FieldError({
  field,
  errors,
}: {
  field: CheckoutField;
  errors: CheckoutErrors;
}) {
  if (!errors[field]) return null;
  return (
    <p id={`${FIELD_IDS[field]}-error`} className="field-error">
      {errors[field]}
    </p>
  );
}

function describedBy(field: CheckoutField, errors: CheckoutErrors) {
  return errors[field] ? `${FIELD_IDS[field]}-error` : undefined;
}

export function CheckoutView() {
  const router = useRouter();
  const {
    items,
    quantity,
    subtotal,
    total,
    isHydrated,
    catalogError,
    clearCart,
  } = useCart();
  const { refresh: refreshCatalog } = useCatalog();
  const [values, setValues] = useState<CheckoutValues>(EMPTY_CHECKOUT);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [submissionKey] = useState(() => crypto.randomUUID());
  const submittingRef = useRef(false);

  function updateField(field: CheckoutField) {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const value = event.target.value;
      setValues((previous) => ({ ...previous, [field]: value }));
      setErrors((previous) => {
        if (!previous[field]) return previous;
        const next = { ...previous };
        delete next[field];
        return next;
      });
      setSubmitError(null);
    };
  }

  function handleBlur(field: CheckoutField) {
    const nextErrors = validateCheckout(values);
    setErrors((previous) => {
      const next = { ...previous };
      if (nextErrors[field]) next[field] = nextErrors[field];
      else delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    if (items.length === 0) {
      setSubmitError("Your cart is empty. Return to the collection before checking out.");
      return;
    }

    const nextErrors = validateCheckout(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Please review the highlighted fields below.");
      const firstField = Object.keys(nextErrors)[0] as CheckoutField;
      document.getElementById(FIELD_IDS[firstField])?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          submissionKey,
          customer: {
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            email: values.email.trim(),
            street: values.street.trim(),
            city: values.city.trim(),
            postalCode: values.postalCode.trim(),
            instructions: values.instructions.trim(),
          },
          items: items.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
          })),
          expectedTotal: total,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            order?: { id?: string };
            accessToken?: string;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.order?.id || !payload.accessToken) {
        throw new Error(
          payload?.message ||
            "We could not place the demo order. Your cart and details are still here, so you can try again.",
        );
      }

      try {
        sessionStorage.setItem(
          CONFIRMATION_STORAGE_KEY,
          JSON.stringify({
            orderId: payload.order.id,
            accessToken: payload.accessToken,
          }),
        );
      } catch {
        throw new Error(
          "The order was saved, but this browser blocked the confirmation hand-off. Please retry from this same checkout.",
        );
      }

      clearCart();
      router.push("/order-confirmation");
    } catch (error) {
      submittingRef.current = false;
      setSubmitting(false);
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "We could not place the demo order. Your cart and details are still here, so you can try again.",
      );
    }
  }

  if (!isHydrated) {
    return (
      <div className="site-container py-space-xl" aria-busy="true">
        <h1 className="font-display text-headline-lg text-on-surface">Checkout</h1>
        <p className="mt-3 text-body-md text-on-surface-variant">
          Preparing your checkout…
        </p>
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-surface-container-low" />
      </div>
    );
  }

  if (catalogError) {
    return (
      <div>
        <CheckoutStepper />
        <section className="site-container py-space-xl">
          <div role="alert" className="mx-auto max-w-xl rounded-xl border border-error/25 bg-error-container p-6 text-center">
            <h1 className="font-display text-headline-md text-on-error-container">
              Checkout is temporarily unavailable
            </h1>
            <p className="mt-2 text-body-sm leading-relaxed text-on-error-container/85">
              {catalogError} Your saved cart has not been erased.
            </p>
            <button
              type="button"
              onClick={() => void refreshCatalog()}
              className="btn btn-primary mt-4"
            >
              Try again
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <CheckoutStepper />
        <section className="site-container py-space-xl">
          <div className="mx-auto max-w-xl rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-lg text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-secondary">
              <LockIcon size={24} />
            </span>
            <h1 className="mt-4 font-display text-headline-md text-on-surface">
              Your cart is empty
            </h1>
            <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">
              Checkout is paused until you choose a fountain. Add a handcrafted
              piece to begin the quiet delivery process.
            </p>
            <Link href="/#collection" className="btn btn-primary mt-6">
              Return to the collection
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-space-xl">
      <h1 className="sr-only">Checkout — delivery and payment</h1>
      <CheckoutStepper />

      <section className="site-container pt-space-lg">
        <div className="mb-space-lg flex flex-col justify-between gap-space-sm rounded-lg border border-tertiary/25 bg-[#fbf4e6] p-space-md sm:flex-row sm:items-center">
          <div className="flex items-start gap-space-sm">
            <span className="mt-0.5 text-secondary">
              <InfoIcon size={23} />
            </span>
            <div>
              <p className="text-label-md font-semibold uppercase tracking-wider text-secondary">
                Demo checkout • Cash on Delivery
              </p>
              <p className="mt-1 text-body-sm leading-relaxed text-on-surface">
                This storefront is not connected to a payment or fulfilment
                service. Submitting will not send an order to the store, charge
                you, or collect card details.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded bg-surface-container-lowest/70 px-3 py-2 text-on-surface-variant sm:self-center">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-secondary" />
            <span className="text-label-sm uppercase tracking-wider">
              Demo order preview
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12 lg:gap-space-xl">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            noValidate
            className="order-2 flex flex-col gap-space-lg lg:order-1 lg:col-span-7"
          >
            <div className="rounded-xl border border-on-surface/[0.04] bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-display text-headline-sm text-primary">01</span>
                  <h2 className="font-display text-headline-sm text-on-surface">
                    Recipient Information
                  </h2>
                </div>
                <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                  Courier Verification
                </span>
              </div>
              <div className="grid grid-cols-1 gap-space-md pt-space-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={FIELD_IDS.fullName}>
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    id={FIELD_IDS.fullName}
                    name="fullName"
                    type="text"
                    autoComplete={inputAutocomplete.fullName}
                    value={values.fullName}
                    onChange={updateField("fullName")}
                    onBlur={() => handleBlur("fullName")}
                    aria-required="true"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={describedBy("fullName", errors)}
                    className="field-input"
                    placeholder="Your full name"
                    maxLength={80}
                  />
                  <FieldError field="fullName" errors={errors} />
                </div>
                <div>
                  <label className="field-label" htmlFor={FIELD_IDS.phone}>
                    Mobile Number <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      <PhoneIcon size={16} />
                    </span>
                    <input
                      id={FIELD_IDS.phone}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete={inputAutocomplete.phone}
                      value={values.phone}
                      onChange={updateField("phone")}
                      onBlur={() => handleBlur("phone")}
                      aria-required="true"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={describedBy("phone", errors) ?? "phone-hint"}
                      className="field-input pl-10"
                      placeholder="01XXX XXXXXX or +8801XXXXXXXXX"
                    />
                  </div>
                  {!errors.phone ? (
                    <p
                      id="phone-hint"
                      className="mt-1 text-label-sm text-on-surface-variant"
                    >
                      For delivery calls and parcel verification.
                    </p>
                  ) : null}
                  <FieldError field="phone" errors={errors} />
                </div>
                <div>
                  <label className="field-label" htmlFor={FIELD_IDS.email}>
                    Email Address{" "}
                    <span className="font-normal normal-case tracking-normal text-on-surface-variant">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id={FIELD_IDS.email}
                    name="email"
                    type="email"
                    autoComplete={inputAutocomplete.email}
                    value={values.email}
                    onChange={updateField("email")}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describedBy("email", errors) ?? "email-hint"}
                    className="field-input"
                    placeholder="you@example.com"
                  />
                  {!errors.email ? (
                    <p
                      id="email-hint"
                      className="mt-1 text-label-sm text-on-surface-variant"
                    >
                      For the digital warranty card and care guide.
                    </p>
                  ) : null}
                  <FieldError field="email" errors={errors} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-on-surface/[0.04] bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-display text-headline-sm text-primary">02</span>
                  <h2 className="font-display text-headline-sm text-on-surface">
                    Delivery Address
                  </h2>
                </div>
                <span className="text-label-sm uppercase tracking-widest text-secondary">
                  Free Nationwide Delivery
                </span>
              </div>
              <div className="grid grid-cols-1 gap-space-md pt-space-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={FIELD_IDS.street}>
                    Street Address / House / Road / Area{" "}
                    <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id={FIELD_IDS.street}
                    name="street"
                    rows={2}
                    autoComplete={inputAutocomplete.street}
                    value={values.street}
                    onChange={updateField("street")}
                    onBlur={() => handleBlur("street")}
                    aria-required="true"
                    aria-invalid={Boolean(errors.street)}
                    aria-describedby={describedBy("street", errors)}
                    className="field-input resize-none"
                    placeholder="House, road, block, and area"
                    maxLength={200}
                  />
                  <FieldError field="street" errors={errors} />
                </div>
                <div>
                  <label className="field-label" htmlFor={FIELD_IDS.city}>
                    City / District <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={FIELD_IDS.city}
                      name="city"
                      type="text"
                      list="bd-districts"
                      autoComplete={inputAutocomplete.city}
                      value={values.city}
                      onChange={updateField("city")}
                      onBlur={() => handleBlur("city")}
                      aria-required="true"
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={describedBy("city", errors)}
                      className="field-input pr-9"
                      placeholder="e.g. Dhaka"
                      maxLength={80}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    >
                      <ChevronDownIcon size={17} />
                    </span>
                  </div>
                  <datalist id="bd-districts">
                    {DISTRICT_SUGGESTIONS.map((district) => (
                      <option key={district} value={district} />
                    ))}
                  </datalist>
                  <FieldError field="city" errors={errors} />
                </div>
                <div>
                  <label className="field-label" htmlFor={FIELD_IDS.postalCode}>
                    Postal / Zip Code{" "}
                    <span className="font-normal normal-case tracking-normal text-on-surface-variant">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id={FIELD_IDS.postalCode}
                    name="postalCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete={inputAutocomplete.postalCode}
                    value={values.postalCode}
                    onChange={updateField("postalCode")}
                    onBlur={() => handleBlur("postalCode")}
                    aria-invalid={Boolean(errors.postalCode)}
                    aria-describedby={describedBy("postalCode", errors)}
                    className="field-input"
                    placeholder="4-digit code"
                    maxLength={4}
                  />
                  <FieldError field="postalCode" errors={errors} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor={FIELD_IDS.instructions}>
                    Special Delivery Instructions{" "}
                    <span className="font-normal normal-case tracking-normal text-on-surface-variant">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id={FIELD_IDS.instructions}
                    name="instructions"
                    type="text"
                    value={values.instructions}
                    onChange={updateField("instructions")}
                    onBlur={() => handleBlur("instructions")}
                    aria-invalid={Boolean(errors.instructions)}
                    aria-describedby={describedBy("instructions", errors)}
                    className="field-input"
                    placeholder="e.g. Please call before arrival"
                    maxLength={300}
                  />
                  <FieldError field="instructions" errors={errors} />
                </div>
              </div>
            </div>

            <fieldset className="rounded-xl border border-on-surface/[0.04] bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg">
              <legend className="sr-only">Payment preference</legend>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-display text-headline-sm text-primary">03</span>
                  <h2 className="font-display text-headline-sm text-on-surface">
                    Payment Preference
                  </h2>
                </div>
                <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
                  No credentials collected
                </span>
              </div>
              <div className="flex flex-col gap-space-sm pt-space-sm">
                <label className="relative flex cursor-pointer items-start gap-3 rounded-lg bg-surface-container-low p-space-md shadow-sm">
                  <span className="mt-0.5 flex h-5 items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      defaultChecked
                      className="h-4 w-4 accent-primary"
                    />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-wrap items-center gap-2 font-display text-headline-sm text-on-surface">
                        Cash on Delivery (COD)
                        <span className="rounded-full bg-secondary-container px-2 py-0.5 font-sans text-label-sm uppercase text-on-secondary-container">
                          Demo only
                        </span>
                      </span>
                      <LockIcon size={18} className="text-primary" />
                    </span>
                    <span className="mt-1 block text-body-sm leading-relaxed text-on-surface-variant">
                      A demo order preview. No cash, bKash, or card payment will be
                      collected or requested.
                    </span>
                    <span className="mt-2 flex items-center gap-2 text-label-sm text-secondary">
                      <InfoIcon size={14} />
                      No advance payment is collected in this storefront demo.
                    </span>
                  </span>
                </label>

                <label
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-start gap-3 rounded-lg bg-surface-container-lowest p-space-md opacity-65 shadow-sm"
                >
                  <span className="mt-0.5 flex h-5 items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mfs"
                      disabled
                      className="h-4 w-4 accent-primary"
                    />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-wrap items-center gap-2 font-display text-headline-sm text-on-surface">
                        bKash / Nagad Instant Mobile Payment
                        <span className="rounded bg-surface-container-high px-2 py-0.5 font-sans text-label-sm text-on-surface-variant">
                          Unavailable
                        </span>
                      </span>
                      <PhoneIcon size={18} className="text-on-surface-variant" />
                    </span>
                    <span className="mt-1 block text-body-sm text-on-surface-variant">
                      Not connected in this demo. No mobile banking integration is
                      available.
                    </span>
                  </span>
                </label>

                <label
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-start gap-3 rounded-lg bg-surface-container-lowest p-space-md opacity-65 shadow-sm"
                >
                  <span className="mt-0.5 flex h-5 items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="h-4 w-4 accent-primary"
                    />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-wrap items-center gap-2 font-display text-headline-sm text-on-surface">
                        Credit / Debit Card
                        <span className="rounded bg-surface-container-high px-2 py-0.5 font-sans text-label-sm text-on-surface-variant">
                          Unavailable
                        </span>
                      </span>
                      <CardIcon size={18} className="text-on-surface-variant" />
                    </span>
                    <span className="mt-1 block text-body-sm text-on-surface-variant">
                      Card processing is not connected. This demo never collects
                      card numbers or payment credentials.
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="space-y-space-sm pt-space-xs">
              {submitError ? (
                <div
                  role="alert"
                  className="rounded border border-error/25 bg-error-container px-4 py-3 text-body-sm text-on-error-container"
                >
                  {submitError}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 py-4 text-center font-display text-headline-sm text-on-primary shadow-md transition-colors hover:bg-primary-container disabled:cursor-wait disabled:opacity-75"
              >
                <LockIcon size={20} />
                {submitting
                  ? "Placing demo order…"
                  : `Place Demo Order (${formatPrice(total)})`}
              </button>
              <p className="mx-auto max-w-xl text-center text-body-sm leading-relaxed text-on-surface-variant">
                This is a demo order. By submitting, you agree that the storefront
                will show a confirmation preview only. No payment, fulfilment, or
                delivery will occur.
              </p>
            </div>
          </form>

          <aside className="order-1 w-full lg:order-2 lg:col-span-5 lg:sticky lg:top-32">
            <div className="rounded-xl border border-on-surface/[0.04] bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-outline-variant/25 px-5 py-4 lg:px-6">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display text-headline-md text-on-surface">
                    Order Summary
                  </h2>
                  <span className="text-label-sm text-primary">
                    {quantity} {quantity === 1 ? "item" : "items"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSummaryOpen((open) => !open)}
                  aria-expanded={summaryOpen}
                  aria-controls="checkout-order-summary"
                  className="inline-flex min-h-9 items-center gap-1 text-label-sm uppercase tracking-wider text-on-surface-variant lg:hidden"
                >
                  {summaryOpen ? "Hide" : "Show"}
                  <ChevronDownIcon
                    size={15}
                    className={`transition-transform ${summaryOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div
                id="checkout-order-summary"
                className={`px-5 py-4 lg:block lg:px-6 ${summaryOpen ? "block" : "hidden"}`}
              >
                <ul className="divide-y divide-outline-variant/20">
                  {items.map((line) => (
                    <li key={line.slug} className="flex gap-space-sm py-space-sm first:pt-0">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                        <Image
                          src={line.product.cartImage}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <span className="absolute bottom-1 right-1 rounded bg-surface/90 px-1.5 py-0.5 text-[9px] text-on-surface backdrop-blur">
                          {line.quantity}x
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="break-words font-display text-[18px] leading-6 text-on-surface">
                              {line.product.name}
                            </h3>
                            <p className="text-label-sm leading-4 text-primary">
                              {line.product.collectionLine}
                            </p>
                          </div>
                          <span className="price shrink-0 text-body-md text-on-surface">
                            {formatPrice(line.lineTotal)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-label-sm text-secondary">
                          {line.product.flowDescription}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-space-sm space-y-space-xs border-t border-outline-variant/25 pt-space-sm text-body-sm">
                  <div className="flex justify-between gap-3 text-on-surface-variant">
                    <span>
                      Subtotal ({quantity} {quantity === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium text-on-surface">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-on-surface-variant">
                    <span>{FREE_SHIPPING.label}</span>
                    <span className="font-medium uppercase text-secondary">
                      {FREE_SHIPPING.valueLabel}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-on-surface-variant">
                    <span>Cash-on-delivery processing</span>
                    <span className="font-medium uppercase text-secondary">
                      Included
                    </span>
                  </div>
                </div>

                <div className="mt-space-sm flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-surface-container-low p-space-md">
                  <div>
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Total payable
                    </p>
                    <p className="text-label-sm text-secondary">
                      Inclusive of all local taxes
                    </p>
                  </div>
                  <span className="price text-display-md font-semibold leading-none text-primary">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="mt-space-sm rounded-lg bg-surface-container-low px-3 py-2.5">
                  <p className="flex items-center gap-2 text-label-sm font-semibold uppercase tracking-wider text-secondary">
                    <LockIcon size={15} />
                    Cash on Delivery (demo)
                  </p>
                  <p className="mt-1 text-body-sm leading-relaxed text-on-surface-variant">
                    {FREE_SHIPPING.detail}. No payment is collected online.
                  </p>
                </div>

                <div className="mt-space-md flex flex-col gap-3">
                  <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                    TerraNova craft pledges
                  </p>
                  {[
                    {
                      icon: <WavesMini />,
                      title: "48h pre-dispatch acoustic inspection",
                      body: "Every pump and basin is run in the studio to test motor silence and droplet cadence.",
                    },
                    {
                      icon: <ShieldIcon size={17} />,
                      title: "Shockproof custom packing",
                      body: "Molded cushioning cradles fragile ceramic elements across transit.",
                    },
                  ].map((pledge) => (
                    <div key={pledge.title} className="flex items-start gap-2">
                      <span className="mt-0.5 text-secondary">{pledge.icon}</span>
                      <div>
                        <p className="text-label-md font-semibold text-on-surface">
                          {pledge.title}
                        </p>
                        <p className="text-body-sm leading-relaxed text-on-surface-variant">
                          {pledge.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/cart"
              className="mt-space-sm inline-flex min-h-10 items-center gap-2 px-2 text-label-lg text-on-surface transition-colors hover:text-primary"
            >
              <ArrowLeftIcon size={17} />
              Back to cart
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}

function WavesMini() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 8c1.5 0 1.5-1.5 3-1.5S6.5 8 8 8s1.5-1.5 3-1.5S12.5 8 14 8s1.5-1.5 3-1.5S18.5 8 20 8" />
      <path d="M2 14c1.5 0 1.5-1.5 3-1.5S6.5 14 8 14s1.5-1.5 3-1.5S12.5 14 14 14s1.5-1.5 3-1.5S18.5 14 20 14" />
    </svg>
  );
}

