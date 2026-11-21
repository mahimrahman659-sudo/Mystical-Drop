import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { getBaseUrl } from "@/lib/auth/server";
import { validateCheckout } from "@/lib/checkout";
import { createOrder, OrderError } from "@/lib/db/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const orderRequestSchema = z.object({
  submissionKey: z.string().uuid(),
  customer: z.object({
    fullName: z.string().max(80),
    phone: z.string().max(40),
    email: z.string().max(200),
    street: z.string().max(200),
    city: z.string().max(80),
    postalCode: z.string().max(10),
    instructions: z.string().max(300),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(10),
  expectedTotal: z.number().int().nonnegative(),
});

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([
    getBaseUrl(),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  return allowed.has(origin.replace(/\/$/, ""));
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { message: "This request could not be verified." },
      { status: 403 },
    );
  }

  let parsed: z.infer<typeof orderRequestSchema>;
  try {
    parsed = orderRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { message: "Review the checkout details and try again." },
      { status: 400 },
    );
  }

  const validation = validateCheckout(parsed.customer);
  if (Object.keys(validation).length > 0) {
    return NextResponse.json(
      {
        message: "Review the highlighted checkout fields and try again.",
        errors: validation,
      },
      { status: 400 },
    );
  }

  const slugs = parsed.items.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) {
    return NextResponse.json(
      { message: "The cart contains duplicate items. Refresh the cart and retry." },
      { status: 400 },
    );
  }

  try {
    const user = await getSessionUser();
    const result = await createOrder({
      submissionKey: parsed.submissionKey,
      customer: {
        fullName: parsed.customer.fullName.trim(),
        phone: parsed.customer.phone.trim(),
        email: parsed.customer.email.trim(),
        street: parsed.customer.street.trim(),
        city: parsed.customer.city.trim(),
        postalCode: parsed.customer.postalCode.trim(),
        instructions: parsed.customer.instructions.trim(),
      },
      selections: parsed.items,
      expectedTotal: parsed.expectedTotal,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
    });

    return NextResponse.json(
      { order: result.order, accessToken: result.accessToken },
      {
        status: result.created ? 201 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        message:
          "We could not save the demo order. Your cart is still intact. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
