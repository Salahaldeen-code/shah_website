import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeShowcase: GlobalConfig = {
  slug: "home-showcase",
  label: "Active Life Showcase",
  admin: {
    group: "Home",
    description:
      "Home → Active Life brand copy. Collage images come from Categories.",
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
          label: "Brand copy",
          fields: [
            { name: "brandLine1", type: "text", localized: true, required: true },
            { name: "brandLine2", type: "text", localized: true, required: true },
            { name: "brandAmp", type: "text", localized: true, required: true },
            { name: "brandLine3", type: "text", localized: true, required: true },
            { name: "script", type: "text", localized: true, required: true },
            { name: "tagline", type: "textarea", localized: true, required: true },
            { name: "viewMore", type: "text", localized: true },
          ],
        },
      ],
    },
  ],
};
