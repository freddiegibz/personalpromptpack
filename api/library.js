import { list, put } from "@vercel/blob";

const PATHNAME = "library.json";

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      const { blobs } = await list({ prefix: PATHNAME, limit: 1 });
      const blob = blobs.find((item) => item.pathname === PATHNAME);

      if (!blob) {
        return response.status(200).json([]);
      }

      const blobResponse = await fetch(blob.url, { cache: "no-store" });
      const data = await blobResponse.json();
      return response.status(200).json(data);
    }

    if (request.method === "PUT") {
      const body =
        typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body);

      await put(PATHNAME, body, {
        access: "public",
        addRandomSuffix: false,
      allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      });

      return response.status(200).json({ ok: true });
    }

    response.setHeader("Allow", ["GET", "PUT"]);
    return response.status(405).end();
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : "Unknown storage error",
    });
  }
}
