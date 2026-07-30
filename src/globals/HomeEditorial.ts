import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeEditorial: GlobalConfig = {
  slug: "home-editorial",
  label: "Editorial Showcase",
  admin: {
    group: "Home",
    description: "Home → TRAIN / COMPETE / EVOLVE stepped block.",
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
          label: "Copy",
          fields: [
            {
              name: "topText",
              type: "text",
              localized: true,
              required: true,
              label: "Top bar",
              admin: { description: "e.g. TRAIN" },
            },
            {
              name: "middleText",
              type: "text",
              localized: true,
              required: true,
              label: "Middle bar",
              admin: { description: "e.g. COMPETE" },
            },
            {
              name: "bottomText",
              type: "text",
              localized: true,
              required: true,
              label: "Bottom bar",
              admin: { description: "e.g. EVOLVE" },
            },
            {
              name: "overlayText",
              type: "text",
              localized: true,
              required: true,
              label: "Script overlay",
              admin: { description: "e.g. Push forward" },
            },
          ],
        },
      ],
    },
  ],
};
