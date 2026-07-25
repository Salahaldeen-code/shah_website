import type { CollectionConfig } from "payload";

import { revalidateContent, revalidateContentDelete } from "../hooks/revalidateContent.ts";

export const GalleryAlbums: CollectionConfig = {
  slug: "gallery-albums",
  labels: {
    singular: "Photo Album",
    plural: "Albums",
  },
  admin: {
    group: "Gallery",
    description: "Gallery page → albums and photos",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "date", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateContent],
    afterDelete: [revalidateContentDelete],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Album info",
          fields: [
            {
              name: "title",
              type: "text",
              localized: true,
              required: true,
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
              required: true,
            },
            {
              name: "venue",
              type: "text",
              localized: true,
            },
            {
              name: "category",
              type: "select",
              options: [
                { label: "Team sports", value: "team" },
                { label: "Racket sports", value: "racket" },
                { label: "Fitness", value: "fitness" },
                { label: "Aquatic", value: "aquatic" },
                { label: "Outdoor", value: "outdoor" },
                { label: "Youth", value: "youth" },
              ],
            },
          ],
        },
        {
          label: "Cover & photos",
          fields: [
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "photos",
              type: "array",
              labels: { singular: "Photo", plural: "Photos" },
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
