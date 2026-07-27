import type { CollectionConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import {
  revalidateContent,
  revalidateContentDelete,
} from "../hooks/revalidateContent.ts";

export const Activities: CollectionConfig = {
  slug: "activities",
  labels: {
    singular: "Activity",
    plural: "Activities",
  },
  orderable: true,
  admin: {
    group: "Home",
    description:
      "Activities with category, media, and photo album — used on home + /gallery",
    useAsTitle: "title",
    defaultColumns: ["image", "title", "category", "slot", "actions"],
    listSearchableFields: ["title", "slug"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateContent],
    afterDelete: [revalidateContentDelete],
  },
  fields: [
    sectionPreviewField(
      homePreviews.activitiesCards,
      "Activity cards + gallery albums",
      "Homepage Activities stage uses cover image/video + layout slots. Gallery page lists these activities; attached photos are the album.",
    ),
    {
      name: "actions",
      type: "ui",
      admin: {
        disableListColumn: false,
        components: {
          Cell: "@/payload/components/ListRowActions#ListRowActions",
        },
      },
      label: "Actions",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "URL path under /gallery/[slug]",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Details",
          fields: [
            {
              name: "title",
              type: "text",
              localized: true,
              required: true,
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
              required: true,
              admin: {
                description: "Pick from Categories collection",
              },
            },
            {
              name: "summary",
              type: "textarea",
              localized: true,
            },
            {
              name: "description",
              type: "textarea",
              localized: true,
            },
            {
              name: "date",
              type: "date",
              admin: {
                description: "Shown on the gallery album page",
              },
            },
            {
              name: "venue",
              type: "text",
              localized: true,
            },
          ],
        },
        {
          label: "Media & album",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Cover image",
              admin: {
                description: "Homepage card + gallery cover",
              },
            },
            {
              name: "video",
              type: "upload",
              relationTo: "media",
              label: "Hover video",
              admin: {
                description: "Optional muted loop on the homepage activity card",
              },
            },
            {
              name: "photos",
              type: "array",
              labels: { singular: "Photo", plural: "Album photos" },
              admin: {
                description:
                  "Gallery album photos for this activity (replaces separate albums)",
              },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: "Homepage layout",
          fields: [
            {
              name: "slot",
              type: "select",
              required: true,
              defaultValue: "topLeft",
              options: [
                { label: "Top left", value: "topLeft" },
                { label: "Bottom right", value: "bottomRight" },
              ],
              admin: {
                description: "Position in the Activities stage pair",
              },
            },
            {
              name: "pair",
              type: "select",
              required: true,
              defaultValue: "pair-a",
              options: [
                { label: "Pair A", value: "pair-a" },
                { label: "Pair B", value: "pair-b" },
              ],
            },
            {
              name: "order",
              type: "number",
              defaultValue: 0,
              admin: {
                position: "sidebar",
              },
            },
          ],
        },
      ],
    },
  ],
};
