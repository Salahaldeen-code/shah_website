import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeImpact: GlobalConfig = {
  slug: "home-impact",
  label: "Impact Section",
  admin: {
    group: "Home",
    description: "Home → Sports Strong / scroll impact visuals.",
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
          label: "Headlines",
          fields: [
            { name: "lineA", type: "text", localized: true, required: true },
            { name: "lineB", type: "text", localized: true, required: true },
            { name: "scriptA", type: "text", localized: true, required: true },
            { name: "scriptB", type: "text", localized: true, required: true },
          ],
        },
        {
          label: "Images",
          fields: [
            {
              name: "background",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "floatLeft",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "floatRight",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
      ],
    },
  ],
};
