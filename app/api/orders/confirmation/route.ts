import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { getOrderForConfirmation } from "@/lib/db/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const confirmationSchema = z.object({
  orderId: z.string().regex(/^[a-f0-9]{24}$/i),
  accessToken: z.string().min(32).max(128).optional(),
});

export async function POST(request: Request) {
  let parsed: z.infer<typeof confirmationSchema>;
  try {
    parsed = confirmationSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Invalid confirmation request." }, { status: 400 });
  }

  try {
    const user = await getSessionUser();
    const order = await getOrderForConfirmation(
      parsed.orderId,
      parsed.accessToken ?? null,
      user?.id ?? null,
    );

    if (!order) {
      return NextResponse.json(
        { message: "This order confirmation is not available in this browser." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { order },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "The confirmation is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
