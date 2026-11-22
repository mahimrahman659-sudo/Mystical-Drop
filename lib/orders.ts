export const FULFILLMENT_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ALLOWED_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export type PaymentStatus = "not_collected" | "paid" | "refunded";

export type OrderCustomer = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  instructions: string;
};

export type OrderItemSnapshot = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
  collectionLine: string;
  flowDescription: string;
  included: string;
};

export type OrderStatusEvent = {
  status: FulfillmentStatus;
  changedAt: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  note?: string;
};

export type CustomerOrderStatusEvent = Pick<
  OrderStatusEvent,
  "status" | "changedAt"
>;

export type OrderConfirmation = {
  id: string;
  reference: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItemSnapshot[];
  quantity: number;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  demo: true;
  fulfillmentStatus: FulfillmentStatus;
  statusHistory: CustomerOrderStatusEvent[];
  deliveryEstimate: string;
  deliveryEstimateNote: string;
};

export type CatalogSelection = {
  slug: string;
  quantity: number;
};

export function canTransition(
  from: FulfillmentStatus,
  to: FulfillmentStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextFulfillmentStatuses(
  from: FulfillmentStatus,
): FulfillmentStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

export function isFulfillmentStatus(value: string): value is FulfillmentStatus {
  return (FULFILLMENT_STATUSES as readonly string[]).includes(value);
}

export function fulfillmentEstimate(city: string): {
  deliveryEstimate: string;
  deliveryEstimateNote: string;
} {
  const isDhaka = /dhaka/i.test(city);
  return {
    deliveryEstimate: isDhaka ? "24–48 hours" : "3–4 working days",
    deliveryEstimateNote: isDhaka ? "Dhaka metropolitan" : "Nationwide courier",
  };
}

export function formatOrderDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
