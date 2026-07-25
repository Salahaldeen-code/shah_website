import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const GalleryUi: GlobalConfig = {
  slug: "gallery-ui",
  label: "Gallery UI",
  admin: {
    group: "Gallery",
    description: "Gallery page → titles and button labels",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Page headings",
          fields: [
            { name: "title", type: "text", localized: true, required: true },
            { name: "subtitle", type: "textarea", localized: true },
          ],
        },
        {
          label: "Actions & labels",
          fields: [
            { name: "viewAlbum", type: "text", localized: true },
            { name: "backToGallery", type: "text", localized: true },
            { name: "photosHeading", type: "text", localized: true },
            { name: "photoCount", type: "text", localized: true },
          ],
        },
      ],
    },
  ],
};
