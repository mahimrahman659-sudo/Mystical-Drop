import "server-only";

import { createHash, createHmac, randomInt } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/client";
import { FREE_SHIPPING } from "@/lib/cart";
import { PRODUCT_COLLECTION } from "@/lib/db/products";
import {
  ALLOWED_TRANSITIONS,
  fulfillmentEstimate,
  type FulfillmentStatus,
  type OrderConfirmation,
  type OrderCustomer,
  type OrderItemSnapshot,
  type OrderStatusEvent,
  type PaymentStatus,
} from "@/lib/orders";
import type { StoredProduct } from "@/lib/catalog";

export const ORDER_COLLECTION = "orders";

export type OrderDocument = {
  _id?: ObjectId;
  reference: string;
  submissionKey: string;
  userId: string | null;
  userEmail: string | null;
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
  statusHistory: OrderStatusEvent[];
  confirmationTokenHash: string;
  deliveryEstimate: string;
  deliveryEstimateNote: string;
  createdAt: Date;
  updatedAt: Date;
};

export class OrderError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "OrderError";
    this.status = status;
    this.code = code;
  }
}

type CreateOrderInput = {
  submissionKey: string;
  customer: OrderCustomer;
  selections: Array<{ slug: string; quantity: number }>;
  expectedTotal: number;
  userId: string | null;
  userEmail: string | null;
};

export type CreateOrderResult = {
  order: OrderConfirmation;
  accessToken: string;
  created: boolean;
};

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value) {
    throw new Error("BETTER_AUTH_SECRET is not configured.");
  }
  return value;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function orderAccessToken(
  orderId: string,
  submissionKey: string,
): string {
  return createHmac("sha256", secret())
    .update(`terranova-order:${orderId}:${submissionKey}`)
    .digest("hex");
}

function isDuplicateKeyError(error: unknown): error is {
  code?: number;
  keyPattern?: Record<string, number>;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

async function freshReference(): Promise<string> {
  return `TNV-${randomInt(10000, 100000)}`;
}

function selectionSignature(
  lines: Array<{ slug: string; quantity: number }>,
): string {
  return lines
    .map((line) => `${line.slug}:${line.quantity}`)
    .sort()
    .join("|");
}

function existingSubmission(
  existing: OrderDocument,
  input: CreateOrderInput,
): CreateOrderResult {
  if (existing.userId && existing.userId !== input.userId) {
    throw new OrderError(
      409,
      "SUBMISSION_CONFLICT",
      "This checkout submission belongs to another account.",
    );
  }
  if (
    selectionSignature(existing.items) !==
    selectionSignature(input.selections)
  ) {
    throw new OrderError(
      409,
      "SUBMISSION_CONFLICT",
      "This checkout attempt was already used for a different cart.",
    );
  }

  const existingToken = orderAccessToken(
    existing._id!.toHexString(),
    existing.submissionKey,
  );
  return {
    order: toOrderConfirmation(existing),
    accessToken: existingToken,
    created: false,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.selections.length) {
    throw new OrderError(400, "EMPTY_CART", "Your cart is empty.");
  }

  if (input.selections.some((line) => !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10)) {
    throw new OrderError(400, "INVALID_QUANTITY", "Quantities must be whole numbers between 1 and 10.");
  }

  const collection = getDb().collection<OrderDocument>(ORDER_COLLECTION);
  const previousSubmission = await collection.findOne({
    submissionKey: input.submissionKey,
  });
  if (previousSubmission) {
    return existingSubmission(previousSubmission, input);
  }

  const slugs = Array.from(new Set(input.selections.map((line) => line.slug)));

  const docs = await getDb()
    .collection<StoredProduct>(PRODUCT_COLLECTION)
    .find({ slug: { $in: slugs }, status: "active" })
    .toArray();

  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  const items: OrderItemSnapshot[] = [];
  let quantity = 0;

  for (const line of input.selections) {
    const product = bySlug.get(line.slug);
    if (!product) {
      throw new OrderError(
        409,
        "UNAVAILABLE",
        "One or more fountains in your cart are no longer available. Review your cart before trying again.",
      );
    }

    if (
      typeof product.price !== "number" ||
      !Number.isInteger(product.price) ||
      product.price < 1
    ) {
      throw new OrderError(
        409,
        "PRICE_UNAVAILABLE",
        "One or more fountains in your cart does not have a confirmed price yet. Review your cart before trying again.",
      );
    }

    const lineTotal = product.price * line.quantity;
    items.push({
      slug: product.slug,
      name: product.name,
      quantity: line.quantity,
      unitPrice: product.price,
      lineTotal,
      image: product.cartImage,
      collectionLine: product.collectionLine,
      flowDescription: product.flowDescription,
      included: product.included[0] ?? "",
    });
    quantity += line.quantity;
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = FREE_SHIPPING.amount;
  const total = subtotal + shipping;

  if (input.expectedTotal !== total) {
    throw new OrderError(
      409,
      "TOTAL_CHANGED",
      "The current price of one or more fountains has changed. Please return to your cart and review the updated total.",
    );
  }

  const orderId = new ObjectId();
  const accessToken = orderAccessToken(orderId.toHexString(), input.submissionKey);
  const now = new Date();
    const delivery = fulfillmentEstimate();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const order: OrderDocument = {
      _id: orderId,
      reference: await freshReference(),
      submissionKey: input.submissionKey,
      userId: input.userId,
      userEmail: input.userEmail,
      customer: input.customer,
      items,
      quantity,
      subtotal,
      shipping,
      total,
      paymentMethod: "Cash on Delivery (demo)",
      paymentStatus: "not_collected",
      demo: true,
      fulfillmentStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          changedAt: now.toISOString(),
          changedBy: null,
          note: "Order created in demo checkout.",
        },
      ],
      confirmationTokenHash: tokenHash(accessToken),
      deliveryEstimate: delivery.deliveryEstimate,
      deliveryEstimateNote: delivery.deliveryEstimateNote,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await collection.insertOne(order);
      return { order: toOrderConfirmation(order), accessToken, created: true };
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;

      if (error.keyPattern?.submissionKey) {
        const existing = await collection.findOne({ submissionKey: input.submissionKey });
        if (!existing) throw error;
        return existingSubmission(existing, input);
      }

      if (error.keyPattern?.reference) {
        continue;
      }

      throw error;
    }
  }

  throw new OrderError(
    503,
    "ORDER_REFERENCE",
    "Could not allocate an order reference. Please try again.",
  );
}

export function toOrderConfirmation(order: OrderDocument): OrderConfirmation {
  return {
    id: order._id!.toHexString(),
    reference: order.reference,
    createdAt: order.createdAt.toISOString(),
    customer: order.customer,
    items: order.items,
    quantity: order.quantity,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    demo: true,
    fulfillmentStatus: order.fulfillmentStatus,
    statusHistory: order.statusHistory.map(({ status, changedAt }) => ({
      status,
      changedAt,
    })),
    deliveryEstimate: order.deliveryEstimate,
    deliveryEstimateNote: order.deliveryEstimateNote,
  };
}

export async function getOrderForConfirmation(
  orderId: string,
  accessToken: string | null,
  userId: string | null,
): Promise<OrderConfirmation | null> {
  if (!ObjectId.isValid(orderId)) return null;
  const order = await getDb()
    .collection<OrderDocument>(ORDER_COLLECTION)
    .findOne({ _id: new ObjectId(orderId) });
  if (!order) return null;

  const ownsOrder = Boolean(userId && order.userId === userId);
  const tokenMatches = Boolean(
    accessToken &&
      order.confirmationTokenHash === tokenHash(accessToken),
  );

  if (!ownsOrder && !tokenMatches) return null;
  return toOrderConfirmation(order);
}

export async function listOrdersForCustomer(
  userId: string,
): Promise<OrderDocument[]> {
  return getDb()
    .collection<OrderDocument>(ORDER_COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
}

export async function getOrderForCustomer(
  orderId: string,
  userId: string,
): Promise<OrderDocument | null> {
  if (!ObjectId.isValid(orderId)) return null;
  return getDb()
    .collection<OrderDocument>(ORDER_COLLECTION)
    .findOne({ _id: new ObjectId(orderId), userId });
}

export async function listAdminOrders(input: {
  query?: string;
  status?: FulfillmentStatus | "all";
  limit?: number;
}): Promise<OrderDocument[]> {
  const conditions: Record<string, unknown>[] = [];

  if (input.query?.trim()) {
    const escaped = input.query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push({
      $or: [
        { reference: { $regex: escaped, $options: "i" } },
        { "customer.fullName": { $regex: escaped, $options: "i" } },
        { "customer.phone": { $regex: escaped, $options: "i" } },
      ],
    });
  }

  if (input.status && input.status !== "all") {
    conditions.push({ fulfillmentStatus: input.status });
  }

  const filter = conditions.length ? { $and: conditions } : {};
  return getDb()
    .collection<OrderDocument>(ORDER_COLLECTION)
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(input.limit ?? 100)
    .toArray();
}

export async function getAdminOrder(orderId: string): Promise<OrderDocument | null> {
  if (!ObjectId.isValid(orderId)) return null;
  return getDb()
    .collection<OrderDocument>(ORDER_COLLECTION)
    .findOne({ _id: new ObjectId(orderId) });
}

export async function getAdminOrderStats(): Promise<{
  totalOrders: number;
  demoOrders: number;
  awaitingAction: number;
  activeProducts: number;
  recentOrders: OrderDocument[];
}> {
  const db = getDb();
  const [totalOrders, demoOrders, awaitingAction, activeProducts, recentOrders] =
    await Promise.all([
      db.collection(ORDER_COLLECTION).countDocuments(),
      db.collection(ORDER_COLLECTION).countDocuments({ demo: true }),
      db.collection(ORDER_COLLECTION).countDocuments({
        fulfillmentStatus: { $in: ["pending", "confirmed"] },
      }),
      db.collection(PRODUCT_COLLECTION).countDocuments({ status: "active" }),
      db
        .collection<OrderDocument>(ORDER_COLLECTION)
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ]);

  return { totalOrders, demoOrders, awaitingAction, activeProducts, recentOrders };
}

export async function updateOrderStatus(input: {
  orderId: string;
  expectedStatus: FulfillmentStatus;
  nextStatus: FulfillmentStatus;
  admin: { id: string; name: string; email: string };
}): Promise<{ ok: true } | { ok: false; reason: "not_found" | "stale" | "invalid" }> {
  if (!ObjectId.isValid(input.orderId)) return { ok: false, reason: "not_found" };

  const allowed = ALLOWED_TRANSITIONS[input.expectedStatus]?.includes(
    input.nextStatus,
  );
  if (!allowed) return { ok: false, reason: "invalid" };

  const statusHistory: OrderStatusEvent = {
    status: input.nextStatus,
    changedAt: new Date().toISOString(),
    changedBy: input.admin,
    note: `Status changed by ${input.admin.email}.`,
  };

  const result = await getDb()
    .collection<OrderDocument>(ORDER_COLLECTION)
    .updateOne(
      {
        _id: new ObjectId(input.orderId),
        fulfillmentStatus: input.expectedStatus,
      },
      {
        $set: {
          fulfillmentStatus: input.nextStatus,
          updatedAt: new Date(),
        },
        $push: { statusHistory },
      },
    );

  if (result.matchedCount === 1) return { ok: true };
  return { ok: false, reason: "stale" };
}
