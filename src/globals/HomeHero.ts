import type { GlobalConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeHero: GlobalConfig = {
  slug: "home-hero",
  label: "Hero Carousel",
  admin: {
    group: "Home",
    description:
      "Top of homepage — shutter carousel, title text, and partners marquee",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    sectionPreviewField(
      homePreviews.heroCarousel,
      "Hero carousel with shutter bars",
      "Each slide = one progress indicator. Within a slide the shutter shows the image first, then the video (uploaded preferred over YouTube).",
    ),
    {
      type: "tabs",
      tabs: [
        {
          label: "Title",
          fields: [
            {
              name: "title",
              type: "text",
              localized: true,
              required: true,
              label: "Shutter title",
              defaultValue: "PSR",
              admin: {
                description:
                  "Word repeated across the yellow shutter bars (e.g. PSR).",
              },
            },
          ],
        },
        {
          label: "Slides",
          fields: [
            {
              name: "slides",
              type: "array",
              minRows: 1,
              labels: { singular: "Slide", plural: "Slides" },
              admin: {
                description:
                  "One indicator per slide. Cycle: still image → video (file wins over YouTube ID).",
              },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Image",
                  admin: {
                    description:
                      "Shown in the first half of this slide’s indicator cycle (also used as video poster).",
                  },
                },
                {
                  name: "alt",
                  type: "text",
                  localized: true,
                  required: true,
                  label: "Alt text",
                },
                {
                  name: "video",
                  type: "upload",
                  relationTo: "media",
                  label: "Video file",
                  admin: {
                    description:
                      "Optional. Plays muted & looped in the second half of this slide. Takes priority over YouTube ID.",
                  },
                },
                {
                  name: "youtubeId",
                  type: "text",
                  label: "YouTube video ID",
                  admin: {
                    description:
                      "Optional fallback when no video file is uploaded. e.g. L3374C3OyrY from youtu.be/L3374C3OyrY.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Partners",
          fields: [
            {
              name: "partnersLabel",
              type: "text",
              localized: true,
              label: "Section label",
              admin: {
                description: "Small eyebrow above the logo marquee (e.g. Partners).",
              },
            },
            {
              name: "partners",
              type: "array",
              labels: { singular: "Partner", plural: "Partners" },
              admin: {
                description:
                  "Logos in the infinite strip under the hero. Leave empty to use the default files in /images/hero/Partners.",
              },
              fields: [
                {
                  name: "logo",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Logo",
                },
                {
                  name: "name",
                  type: "text",
                  localized: true,
                  required: true,
                  label: "Name / alt text",
                },
                {
                  name: "url",
                  type: "text",
                  label: "Link URL",
                  admin: {
                    description: "Optional. Opens when the logo is clicked.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
