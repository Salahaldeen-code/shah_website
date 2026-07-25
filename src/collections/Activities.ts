import type { CollectionConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateContent, revalidateContentDelete } from "../hooks/revalidateContent.ts";


export const Activities: CollectionConfig = {
  slug: "activities",
  labels: {
    singular: "Activity Card",
    plural: "Activities",
  },
  orderable: true,
  admin: {
    group: "Home",
    description: "Home → activity photo cards",
    useAsTitle: "title",
    defaultColumns: ["title", "tag", "slot", "actions"],
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
      homePreviews.activitiesCards,
      "Activity photo cards",
      "Each card is one activity tile in the Activities stage. Drag rows to reorder. Use Edit / Delete on the right.",
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
      name: "title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "tag",
      type: "select",
      required: true,
      options: [
        { label: "Outdoor", value: "outdoor" },
        { label: "Community", value: "community" },
        { label: "Kids", value: "kids" },
        { label: "Wellness", value: "wellness" },
      ],
    },
    {
      name: "slot",
      type: "select",
      required: true,
      options: [
        { label: "Top left", value: "topLeft" },
        { label: "Bottom right", value: "bottomRight" },
      ],
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
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "video",
      type: "upload",
      relationTo: "media",
    },
  ],
};
