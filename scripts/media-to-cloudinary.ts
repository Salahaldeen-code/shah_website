/**
 * Upload every file in ./media to Cloudinary using deterministic public IDs.
 * Standalone — no Payload / Neon. Payload media docs keep the same filenames.
 *
 * Usage: npm run media:cloudinary
 */
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";

import { v2 as cloudinary } from "cloudinary";

const mediaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../media");
const folder = process.env.CLOUDINARY_FOLDER || "psr";

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "avi", "ogv", "mkv"]);
const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "bmp", "tif", "tiff", "ico",
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

function publicIdFor(filename: string): string {
  const resourceType = resourceTypeFor(filename);
  const dot = filename.lastIndexOf(".");
  const base =
    resourceType === "raw" || dot === -1 ? filename : filename.slice(0, dot);
  return folder ? `${folder}/${base}` : base;
}

async function uploadFile(filename: string, buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicIdFor(filename),
        resource_type: resourceTypeFor(filename),
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error(`upload failed: ${filename}`));
          return;
        }
        resolve(result.secure_url);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
}

async function main() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const files = (await readdir(mediaDir)).filter((name) => !name.startsWith("."));
  console.log(
    `Uploading ${files.length} file(s) from media/ to cloud "${cloudName}" folder "${folder}"`,
  );

  let uploaded = 0;
  const failures: string[] = [];

  for (const filename of files) {
    try {
      const buffer = await readFile(path.join(mediaDir, filename));
      const url = await uploadFile(filename, buffer);
      uploaded += 1;
      console.log(`  ok  ${filename} -> ${url}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push(`${filename}: ${reason}`);
      console.log(`  ERR ${filename}: ${reason}`);
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${failures.length} failed.`);
  if (failures.length > 0) {
    console.log(failures.map((line) => `  - ${line}`).join("\n"));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
