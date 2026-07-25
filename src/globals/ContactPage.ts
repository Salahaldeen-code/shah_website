import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const ContactPage: GlobalConfig = {
  slug: "contact-page",
  label: "Contact Page",
  admin: {
    group: "Contact",
    description: "Contact page → hero, details, and form labels",
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
          label: "Hero",
          fields: [
            { name: "eyebrow", type: "text", localized: true },
            { name: "title", type: "text", localized: true, required: true },
            { name: "lead", type: "textarea", localized: true },
          ],
        },
        {
          label: "Details panel",
          fields: [
            { name: "detailsTitle", type: "text", localized: true },
            { name: "detailsLead", type: "textarea", localized: true },
            { name: "imageAlt", type: "text", localized: true },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        {
          label: "Form labels",
          fields: [
            {
              name: "form",
              type: "group",
              label: false,
              fields: [
                { name: "title", type: "text", localized: true },
                { name: "subtitle", type: "textarea", localized: true },
                { name: "name", type: "text", localized: true },
                { name: "namePlaceholder", type: "text", localized: true },
                { name: "email", type: "text", localized: true },
                { name: "emailPlaceholder", type: "text", localized: true },
                { name: "phone", type: "text", localized: true },
                { name: "phonePlaceholder", type: "text", localized: true },
                { name: "subject", type: "text", localized: true },
                { name: "subjectPlaceholder", type: "text", localized: true },
                { name: "message", type: "text", localized: true },
                { name: "messagePlaceholder", type: "text", localized: true },
                { name: "submit", type: "text", localized: true },
                { name: "submitting", type: "text", localized: true },
                { name: "note", type: "text", localized: true },
                { name: "successTitle", type: "text", localized: true },
                { name: "successBody", type: "textarea", localized: true },
                { name: "sendAnother", type: "text", localized: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
