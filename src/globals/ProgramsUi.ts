import type { GlobalConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const ProgramsUi: GlobalConfig = {
  slug: "programs-ui",
  label: "Programs UI",
  admin: {
    group: "Home",
    description: "Home → Programs table titles, filters, and buttons",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    sectionPreviewField(
      homePreviews.programs,
      "Upcoming programs table",
      "Headings, filters, and button labels for the programs overlay.",
    ),
    {
      type: "tabs",
      tabs: [
        {
          label: "Headings",
          fields: [
            { name: "title", type: "text", localized: true, required: true },
            { name: "subtitle", type: "textarea", localized: true },
            { name: "empty", type: "text", localized: true },
          ],
        },
        {
          label: "Actions",
          fields: [
            { name: "join", type: "text", localized: true },
            { name: "joinNow", type: "text", localized: true },
            { name: "close", type: "text", localized: true },
            { name: "viewAll", type: "text", localized: true },
            { name: "showLess", type: "text", localized: true },
          ],
        },
        {
          label: "Filters",
          fields: [
            {
              name: "filters",
              type: "group",
              label: false,
              fields: [
                { name: "all", type: "text", localized: true },
                { name: "team", type: "text", localized: true },
                { name: "racket", type: "text", localized: true },
                { name: "fitness", type: "text", localized: true },
                { name: "aquatic", type: "text", localized: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
