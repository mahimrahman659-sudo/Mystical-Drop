import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/client";
import { MEDIA_COLLECTION, type StoredMedia } from "@/lib/admin/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: MediaRouteProps) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return new Response("Not found", { status: 404 });
  }

  const media = await getDb()
    .collection<StoredMedia>(MEDIA_COLLECTION)
    .findOne(
      { _id: new ObjectId(id) },
      { projection: { data: 1, contentType: 1, filename: 1, size: 1 } },
    );

  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  const body = new Uint8Array(Buffer.from(media.data.buffer));

  return new Response(body, {
    headers: {
      "Content-Type": media.contentType,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `inline; filename="${media.filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ETag: `"${id}"`,
    },
  });
}
