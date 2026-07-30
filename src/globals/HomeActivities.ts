import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeActivities: GlobalConfig = {
  slug: "home-activities",
  label: "Activities Section",
  admin: {
    group: "Home",
    description:
      "Home → Activities title, description, and Join the Movement block.",
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
          label: "Section copy",
          fields: [
            { name: "title", type: "text", localized: true, required: true },
            { name: "description", type: "textarea", localized: true },
          ],
        },
        {
          label: "Join the Movement",
          fields: [
            {
              name: "membership",
              type: "group",
              label: false,
              fields: [
                {
                  name: "titleLine1",
                  type: "text",
                  localized: true,
                  required: true,
                },
                {
                  name: "titleLine2",
                  type: "text",
                  localized: true,
                  required: true,
                },
                { name: "description", type: "textarea", localized: true },
                { name: "joinCta", type: "text", localized: true },
                { name: "imageAlt", type: "text", localized: true },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
