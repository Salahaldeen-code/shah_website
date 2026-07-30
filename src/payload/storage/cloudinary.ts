import { Readable } from "stream";

import type {
  Adapter,
  GeneratedAdapter,
} from "@payloadcms/plugin-cloud-storage/types";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { v2 as cloudinary } from "cloudinary";
import type { Plugin, UploadCollectionSlug } from "payload";

import {
  readCloudinaryCredentials,
  type CloudinaryCredentials,
} from "./credentials.ts";

export type { CloudinaryCredentials };
export { readCloudinaryCredentials };

export type CloudinaryResourceType = "image" | "video" | "raw";

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "m4v",
  "avi",
  "ogv",
  "mkv",
]);

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "svg",
  "bmp",
  "tif",
  "tiff",
  "ico",
]);

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

export function resourceTypeFor(filename: string): CloudinaryResourceType {
  const ext = extensionOf(filename);
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  return "raw";
}

/**
 * Deterministic public ID so an existing media document keeps resolving after
 * the file is (re)uploaded — the URL is derived from `filename` alone on read.
 * Cloudinary appends the delivery format itself for image/video, so the
 * extension is stripped there and kept for raw files.
 */
export function publicIdFor(filename: string, folder: string): string {
  const resourceType = resourceTypeFor(filename);
  const dot = filename.lastIndexOf(".");
  const base =
    resourceType === "raw" || dot === -1 ? filename : filename.slice(0, dot);
  return folder ? `${folder}/${base}` : base;
}

export function cloudinaryUrlFor(
  filename: string,
  credentials: CloudinaryCredentials,
  options?: { width?: number },
): string {
  const resourceType = resourceTypeFor(filename);
  const ext = extensionOf(filename);
  const width = options?.width;

  return cloudinary.url(publicIdFor(filename, credentials.folder), {
    cloud_name: credentials.cloudName,
    resource_type: resourceType,
    secure: true,
    // SVG must keep its own format; raster images are served as whatever the
    // browser accepts, at Cloudinary's automatic quality.
    ...(resourceType === "image" && ext !== "svg"
      ? {
          transformation: [
            ...(width ? [{ width, crop: "limit" as const }] : []),
            { fetch_format: "auto", quality: "auto" },
          ],
        }
      : resourceType === "video" && width
        ? { transformation: [{ width, crop: "limit" as const }] }
        : {}),
    ...(resourceType === "raw" ? {} : { format: ext || undefined }),
  });
}

export function configureCloudinary(credentials: CloudinaryCredentials): void {
  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
    secure: true,
  });
}

export async function uploadBufferToCloudinary({
  buffer,
  filename,
  credentials,
}: {
  buffer: Buffer;
  filename: string;
  credentials: CloudinaryCredentials;
}): Promise<string> {
  configureCloudinary(credentials);

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicIdFor(filename, credentials.folder),
        resource_type: resourceTypeFor(filename),
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error(`Cloudinary upload failed: ${filename}`));
          return;
        }
        resolve(result.secure_url);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
}

function cloudinaryAdapter(credentials: CloudinaryCredentials): Adapter {
  return (): GeneratedAdapter => ({
    name: "cloudinary",
    onInit: () => configureCloudinary(credentials),

    handleUpload: async ({ file }) => {
      let buffer = file.buffer;

      if ((!buffer || buffer.length === 0) && file.tempFilePath) {
        const { readFile } = await import("fs/promises");
        buffer = await readFile(file.tempFilePath);
      }

      await uploadBufferToCloudinary({
        buffer,
        filename: file.filename,
        credentials,
      });
    },

    handleDelete: async ({ filename }) => {
      configureCloudinary(credentials);
      await cloudinary.uploader.destroy(
        publicIdFor(filename, credentials.folder),
        {
          resource_type: resourceTypeFor(filename),
          invalidate: true,
        },
      );
    },

    generateURL: ({ filename }) => cloudinaryUrlFor(filename, credentials),

    staticHandler: async (_req, { params: { filename } }) => {
      const upstream = await fetch(cloudinaryUrlFor(filename, credentials));

      if (!upstream.ok || !upstream.body) {
        return new Response(null, { status: 404, statusText: "Not Found" });
      }

      return new Response(upstream.body, {
        headers: {
          "Content-Type":
            upstream.headers.get("content-type") ?? "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    },
  });
}

/**
 * Serves the given upload collections straight from Cloudinary's CDN. Payload
 * access control is disabled so documents expose the Cloudinary URL directly
 * instead of proxying every request through the Next.js server.
 */
export function cloudinaryStorage({
  collections,
  credentials,
}: {
  collections: UploadCollectionSlug[];
  credentials: CloudinaryCredentials;
}): Plugin {
  const adapter = cloudinaryAdapter(credentials);

  return cloudStoragePlugin({
    collections: Object.fromEntries(
      collections.map((slug) => [
        slug,
        { adapter, disablePayloadAccessControl: true as const },
      ]),
    ),
  });
}
