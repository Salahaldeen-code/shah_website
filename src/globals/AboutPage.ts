import type { GlobalConfig } from "payload";

import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "About Page",
  admin: {
    group: "About Us",
    description: "About page → hero, story, mission, pillars, and CTA",
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
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        {
          label: "Story",
          fields: [
            { name: "storyTitle", type: "text", localized: true },
            { name: "story", type: "textarea", localized: true },
            {
              name: "storyImage",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        {
          label: "Mission & vision",
          fields: [
            { name: "missionTitle", type: "text", localized: true },
            { name: "mission", type: "textarea", localized: true },
            { name: "visionTitle", type: "text", localized: true },
            { name: "vision", type: "textarea", localized: true },
          ],
        },
        {
          label: "Committee",
          fields: [
            { name: "committeeTitle", type: "text", localized: true },
            { name: "committeeSubtitle", type: "textarea", localized: true },
          ],
        },
        {
          label: "Pillars",
          fields: [
            { name: "pillarsTitle", type: "text", localized: true },
            {
              name: "pillars",
              type: "array",
              maxRows: 3,
              labels: { singular: "Pillar", plural: "Pillars" },
              fields: [
                { name: "key", type: "text", required: true },
                { name: "title", type: "text", localized: true, required: true },
                { name: "body", type: "textarea", localized: true, required: true },
              ],
            },
          ],
        },
        {
          label: "Call to action",
          fields: [
            { name: "ctaTitle", type: "text", localized: true },
            { name: "ctaBody", type: "textarea", localized: true },
            { name: "ctaMembership", type: "text", localized: true },
            { name: "ctaActivities", type: "text", localized: true },
          ],
        },
      ],
    },
  ],
};
