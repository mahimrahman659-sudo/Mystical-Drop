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
