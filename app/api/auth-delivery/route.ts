import { NextResponse } from "next/server";
import { getAuthEmailDeliveryStatus } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getAuthEmailDeliveryStatus();
    return NextResponse.json(
      { available: status.available, mode: status.mode },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { available: false, mode: "unavailable" },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
