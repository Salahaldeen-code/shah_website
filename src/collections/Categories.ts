import type { CollectionConfig } from "payload";

import {
  revalidateContent,
  revalidateContentDelete,
} from "../hooks/revalidateContent.ts";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: {
    singular: "Category",
    plural: "Categories",
  },
  orderable: true,
  admin: {
    group: "Home",
    description:
      "Activity categories — also power the Active Life collage images on the homepage",
    useAsTitle: "title",
    defaultColumns: ["title", "updatedAt"],
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
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
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
};
