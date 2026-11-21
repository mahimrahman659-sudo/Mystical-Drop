import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request): Promise<Response> {
  try {
    return await getAuth().handler(request);
  } catch {
    return Response.json(
      {
        message:
          "Authentication is temporarily unavailable. Check the server database and auth configuration.",
      },
      { status: 503 },
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
