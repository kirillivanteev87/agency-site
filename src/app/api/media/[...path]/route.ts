import { getNetlifyMedia, getStorageBackend } from "@/lib/media-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (getStorageBackend() !== "netlify-blobs") {
    return new Response("Not found", { status: 404 });
  }

  const { path: segments } = await params;
  if (!segments?.length || segments.some((s) => s === ".." || s.includes("\0"))) {
    return new Response("Bad request", { status: 400 });
  }

  const key = segments.join("/");
  const media = await getNetlifyMedia(key);
  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(media.stream, {
    headers: {
      "Content-Type": media.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
