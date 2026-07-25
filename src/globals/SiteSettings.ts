import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: {
    group: "Site",
    description: "Shared site name, contact details, and hours",
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
          label: "Identity",
          fields: [
            {
              name: "name",
              type: "text",
              localized: true,
            },
            {
              name: "description",
              type: "textarea",
              localized: true,
            },
          ],
        },
        {
          label: "Contact details",
          fields: [
            {
              name: "email",
              type: "email",
            },
            {
              name: "phoneDisplay",
              type: "text",
            },
            {
              name: "phoneTel",
              type: "text",
            },
            {
              name: "whatsappDisplay",
              type: "text",
            },
            {
              name: "whatsappDigits",
              type: "text",
            },
            {
              name: "addressLines",
              type: "array",
              labels: { singular: "Address line", plural: "Address lines" },
              fields: [
                {
                  name: "line",
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: "Hours",
          fields: [
            {
              name: "hours",
              type: "array",
              labels: { singular: "Hours row", plural: "Hours" },
              fields: [
                { name: "days", type: "text", required: true },
                { name: "time", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
