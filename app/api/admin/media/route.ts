import { NextResponse } from "next/server";
import { getAdminViewer } from "@/lib/admin/auth";
import {
  MediaUploadError,
  saveUploadedImage,
} from "@/lib/admin/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { message: "This upload could not be verified." },
      { status: 403 },
    );
  }

  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") {
    return NextResponse.json(
      { message: "Admin access is required." },
      { status: 403 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "The upload could not be read." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Choose an image file to upload." },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { message: "Choose an image file to upload." },
      { status: 415 },
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { message: "Choose an image under 8 MB." },
      { status: 413 },
    );
  }

  try {
    const saved = await saveUploadedImage({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name,
      uploadedBy: viewer.user.id,
    });
    return NextResponse.json(saved, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof MediaUploadError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Media upload failed:", error);
    return NextResponse.json(
      { message: "The image could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
