import type { GlobalConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeFooter: GlobalConfig = {
  slug: "home-footer",
  label: "Footer & Social",
  admin: {
    group: "Home",
    description: "Social circles and bottom legal bar (copy in code for now)",
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
          fields: [
            sectionPreviewField(
              homePreviews.socialFooter,
              "Social footer reel",
              "Yellow social strip above the legal bar. Edit in src/config/socialFooter.ts.",
            ),
          ],
        },
        {
          label: "Legal bar",
          fields: [
            sectionPreviewField(
              homePreviews.footerLegal,
              "Footer legal links",
              "Privacy, terms, and credits row. Edit in src/components/layout/social-footer/FooterBottom.tsx and related config.",
            ),
          ],
        },
      ],
    },
  ],
};
