import type { OrderCustomer } from "@/lib/orders";

export const DISTRICT_SUGGESTIONS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
] as const;

export const CONFIRMATION_STORAGE_KEY = "terranova-order-confirmation-v1";
export const CHECKOUT_ATTEMPT_STORAGE_KEY = "terranova-checkout-attempts-v1";

const CHECKOUT_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_STORED_CHECKOUT_ATTEMPTS = 8;

export type CheckoutValues = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  instructions: string;
};

export const EMPTY_CHECKOUT: CheckoutValues = {
  fullName: "",
  phone: "",
  email: "",
  street: "",
  city: "",
  postalCode: "",
  instructions: "",
};

export type CheckoutField = keyof CheckoutValues;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export function normalizeBdPhone(value: string): string | null {
  const compact = value.replace(/[\s\-().]/g, "");
  if (/^01[3-9]\d{8}$/.test(compact)) return compact;
  if (/^\+8801[3-9]\d{8}$/.test(compact)) return `0${compact.slice(4)}`;
  if (/^8801[3-9]\d{8}$/.test(compact)) return `0${compact.slice(3)}`;
  return null;
}

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const street = values.street.trim();
  const city = values.city.trim();
  const postalCode = values.postalCode.trim();
  const instructions = values.instructions.trim();

  if (fullName.length < 2) {
    errors.fullName = "Please enter your full name (at least 2 characters).";
  } else if (fullName.length > 80) {
    errors.fullName = "Please keep your name under 80 characters.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Please enter a mobile number for delivery calls.";
  } else if (!normalizeBdPhone(values.phone)) {
    errors.phone =
      "Enter a valid Bangladeshi mobile number, for example 01712 345678 or +880 1712 345678.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address, or leave this field empty.";
  }

  if (street.length < 5) {
    errors.street = "Please enter a complete street address.";
  } else if (street.length > 200) {
    errors.street = "Please keep the address under 200 characters.";
  }

  if (city.length < 2) {
    errors.city = "Please enter your city or district.";
  } else if (city.length > 80) {
    errors.city = "Please keep the city or district under 80 characters.";
  }

  if (postalCode && !/^\d{4}$/.test(postalCode)) {
    errors.postalCode = "Bangladeshi postal codes are four digits.";
  }

  if (instructions.length > 300) {
    errors.instructions = "Please keep delivery instructions under 300 characters.";
  }

  return errors;
}

export function formatDeliveryAddress(customer: OrderCustomer): string[] {
  const cityLine = customer.postalCode
    ? `${customer.city} - ${customer.postalCode}`
    : customer.city;
  return [customer.street, cityLine].filter(Boolean);
}

export function checkoutCartSignature(
  lines: Array<{ slug: string; quantity: number }>,
): string {
  return lines
    .map((line) => `${line.slug}:${line.quantity}`)
    .sort()
    .join("|");
}

export function ensureCheckoutSubmissionKey(cartSignature: string): string {
  if (typeof window === "undefined") return crypto.randomUUID();

  const attempts = readCheckoutAttempts();
  const existing = attempts[cartSignature];
  if (existing && CHECKOUT_KEY_PATTERN.test(existing)) return existing;

  const submissionKey = crypto.randomUUID();
  const entries = Object.entries(attempts)
    .filter(([, key]) => CHECKOUT_KEY_PATTERN.test(key))
    .slice(-(MAX_STORED_CHECKOUT_ATTEMPTS - 1));
  attempts[cartSignature] = submissionKey;
  const trimmed = Object.fromEntries([
    ...entries,
    [cartSignature, submissionKey],
  ]);
  persistCheckoutAttempts(trimmed);
  return submissionKey;
}

export function clearCheckoutAttempt(cartSignature: string): void {
  if (typeof window === "undefined") return;
  const attempts = readCheckoutAttempts();
  if (!(cartSignature in attempts)) return;
  delete attempts[cartSignature];
  persistCheckoutAttempts(attempts);
}

function readCheckoutAttempts(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(CHECKOUT_ATTEMPT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const attempts: Record<string, string> = {};
    for (const [signature, key] of Object.entries(parsed)) {
      if (typeof key === "string" && CHECKOUT_KEY_PATTERN.test(key)) {
        attempts[signature] = key;
      }
    }
    return attempts;
  } catch {
    return {};
  }
}

function persistCheckoutAttempts(attempts: Record<string, string>): void {
  try {
    window.localStorage.setItem(
      CHECKOUT_ATTEMPT_STORAGE_KEY,
      JSON.stringify(attempts),
    );
  } catch {
    return;
  }
}
