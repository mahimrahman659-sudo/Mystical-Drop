import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/db/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "The catalog is temporarily unavailable. Check the MongoDB configuration.",
      },
      { status: 503 },
    );
  }
}
