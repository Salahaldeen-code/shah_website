import type { CollectionConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateContent, revalidateContentDelete } from "../hooks/revalidateContent.ts";


export const Programs: CollectionConfig = {
  slug: "programs",
  labels: {
    singular: "Upcoming Program",
    plural: "Programs",
  },
  orderable: true,
  admin: {
    group: "Home",
    description: "Home → upcoming sessions in the programs table",
    useAsTitle: "title",
    defaultColumns: ["image", "title", "category", "start", "actions"],
    listSearchableFields: ["title"],
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
      homePreviews.programs,
      "Individual program rows in the table",
      "Each row here is one session in the Upcoming Programs table. Drag rows to reorder. Use Edit / Delete on the right.",
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
      type: "tabs",
      tabs: [
        {
          label: "Program details",
          fields: [
            {
              name: "title",
              type: "text",
              localized: true,
              required: true,
            },
            {
              name: "details",
              type: "textarea",
              localized: true,
            },
            {
              name: "category",
              type: "select",
              required: true,
              options: [
                { label: "Team sports", value: "team" },
                { label: "Racket sports", value: "racket" },
                { label: "Fitness", value: "fitness" },
                { label: "Aquatic", value: "aquatic" },
                { label: "Outdoor", value: "outdoor" },
                { label: "Youth", value: "youth" },
              ],
            },
            {
              name: "venue",
              type: "text",
              localized: true,
              required: true,
            },
          ],
        },
        {
          label: "Schedule",
          fields: [
            {
              name: "start",
              type: "date",
              required: true,
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                },
              },
            },
            {
              name: "end",
              type: "date",
              required: true,
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                },
              },
            },
          ],
        },
        {
          label: "Image",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              displayPreview: true,
              admin: {
                components: {
                  Cell: "@/payload/components/ListImageCell#ListImageCell",
                },
              },
            },
            {
              name: "video",
              type: "upload",
              relationTo: "media",
              label: "Hover / preview video",
              admin: {
                description:
                  "Optional muted loop for richer program cards/previews (not required for the Upcoming Programs table).",
              },
            },
            {
              name: "photos",
              type: "array",
              labels: { singular: "Photo", plural: "Gallery photos" },
              admin: {
                description:
                  "Attached images for this program (works like the Activities album photos field).",
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
      ],
    },
  ],
};
