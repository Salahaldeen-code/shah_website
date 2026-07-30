import type { CloudinaryCredentials } from "./credentials.ts";

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

function resourceTypeFor(filename: string): "image" | "video" | "raw" {
  const ext = extensionOf(filename);
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  return "raw";
}

function publicIdFor(filename: string, folder: string): string {
  const resourceType = resourceTypeFor(filename);
  const dot = filename.lastIndexOf(".");
  const base =
    resourceType === "raw" || dot === -1 ? filename : filename.slice(0, dot);
  return folder ? `${folder}/${base}` : base;
}

/** Lightweight admin thumbnail URL — no Cloudinary SDK import. */
export function cloudinaryAdminThumbUrl(
  filename: string,
  credentials: CloudinaryCredentials,
  width = 240,
): string | null {
  const resourceType = resourceTypeFor(filename);
  if (resourceType === "raw") return null;

  const publicId = publicIdFor(filename, credentials.folder);
  const transform =
    resourceType === "image"
      ? `c_limit,w_${width},f_auto,q_auto`
      : `c_limit,w_${width}`;

  return `https://res.cloudinary.com/${credentials.cloudName}/${resourceType}/upload/${transform}/${publicId}`;
}
