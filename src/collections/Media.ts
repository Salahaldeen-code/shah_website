import type { CollectionConfig } from "payload";

import { cloudinaryAdminThumbUrl } from "../payload/storage/adminThumb.ts";
import { readCloudinaryCredentials } from "../payload/storage/credentials.ts";

const cloudinaryCredentials = readCloudinaryCredentials();

function adminThumbFromDoc(doc: { filename?: unknown }): string | null {
  if (!cloudinaryCredentials) return null;
  const filename = typeof doc.filename === "string" ? doc.filename : null;
  if (!filename) return null;
  return cloudinaryAdminThumbUrl(filename, cloudinaryCredentials, 240);
}

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Media File",
    plural: "Media",
  },
  admin: {
    group: "Site",
    description: "Images and videos used across the site",
    defaultColumns: ["filename", "alt", "mimeType", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (!doc || typeof doc !== "object") return doc;
        const thumb = adminThumbFromDoc(doc);
        if (thumb) {
          return { ...doc, thumbnailURL: thumb };
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
    },
  ],
  upload: {
    adminThumbnail: ({ doc }) => adminThumbFromDoc(doc) ?? null,
  },
};
