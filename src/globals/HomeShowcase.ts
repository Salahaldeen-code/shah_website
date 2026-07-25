import type { GlobalConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeShowcase: GlobalConfig = {
  slug: "home-showcase",
  label: "Active Life Showcase",
  admin: {
    group: "Home",
    description: "Home → Active Life brand title, tagline, and collage images",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    sectionPreviewField(
      homePreviews.activeLifeIntro,
      "Active Life collage — title phase",
      "Persatuan Sukan & Rekreasi brand block with side photos. Grid phase preview is on the Grid images tab.",
    ),
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
        {
          label: "Side images",
          fields: [
            {
              name: "sideImages",
              type: "array",
              maxRows: 4,
              labels: { singular: "Side image", plural: "Side images" },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                { name: "alt", type: "text", localized: true },
              ],
            },
          ],
        },
        {
          label: "Grid images",
          fields: [
            sectionPreviewField(
              homePreviews.activeLifeGrid,
              "Active Life collage — grid phase",
              "Photo grid that appears as visitors scroll through this section.",
            ),
            {
              name: "gridImages",
              type: "array",
              labels: { singular: "Grid image", plural: "Grid images" },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                { name: "alt", type: "text", localized: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
