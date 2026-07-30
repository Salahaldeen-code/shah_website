import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeFooter: GlobalConfig = {
  slug: "home-footer",
  label: "Footer & Social",
  admin: {
    group: "Home",
    description:
      "Social circles and bottom legal bar. Social copy lives in src/config/socialFooter.ts; legal links in FooterBottom.tsx.",
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
          label: "Social channels",
          fields: [],
        },
        {
          label: "Legal bar",
          fields: [],
        },
      ],
    },
  ],
};
