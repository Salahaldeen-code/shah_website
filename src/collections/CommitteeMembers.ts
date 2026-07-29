import type { CollectionConfig } from "payload";

import { revalidateContent, revalidateContentDelete } from "../hooks/revalidateContent.ts";


export const CommitteeMembers: CollectionConfig = {
  slug: "committee-members",
  labels: {
    singular: "Committee Member",
    plural: "Committee Members",
  },
  admin: {
    group: "About Us",
    description: "About page → organization chart",
    useAsTitle: "name",
    defaultColumns: ["name", "role", "order", "updatedAt"],
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
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
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
        description:
          "Lower numbers appear first on the About page. Use the chart below — click a number or drag to swap.",
      },
    },
    {
      name: "orderChart",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field:
            "@/payload/components/CommitteeOrderPreview#CommitteeOrderPreview",
        },
      },
    },
    {
      name: "social",
      type: "group",
      fields: [
        { name: "twitter", type: "text" },
        { name: "linkedin", type: "text" },
        { name: "instagram", type: "text" },
        { name: "behance", type: "text" },
      ],
    },
  ],
};
