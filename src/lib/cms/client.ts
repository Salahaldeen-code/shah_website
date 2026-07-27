import "server-only";

import { getPayload, type Payload } from "payload";

import config from "@payload-config";

let cached: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config });
  }
  return cached;
}

export function mediaUrl(
  media:
    | number
    | string
    | { url?: string | null; filename?: string | null }
    | null
    | undefined,
  fallback = "",
): string {
  if (!media) return fallback;
  if (typeof media === "string") return media || fallback;
  if (typeof media === "number") return fallback;
  if (media.url) return media.url;
  if (media.filename) return `/api/media/file/${media.filename}`;
  return fallback;
}

/** Resolve upload fields even when Payload returns a bare media ID. */
export async function resolveMediaUrl(
  payload: Payload,
  media:
    | number
    | string
    | { url?: string | null; filename?: string | null }
    | null
    | undefined,
  fallback = "",
): Promise<string> {
  if (!media) return fallback;
  if (typeof media === "object") return mediaUrl(media, fallback);
  if (typeof media === "string" && media.startsWith("/")) return media;
  if (typeof media === "string" && media.startsWith("http")) return media;

  try {
    const doc = await payload.findByID({
      collection: "media",
      id: media,
      depth: 0,
    });
    return mediaUrl(doc, fallback);
  } catch {
    return fallback;
  }
}
