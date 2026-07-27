import type { CollectionConfig } from "payload";

import { membershipSports } from "../config/membership.ts";

const sportOptions = membershipSports.map((sport) => ({
  label: `${sport.labelEn} / ${sport.labelMs}`,
  value: sport.id,
}));

export const MembershipRegistrations: CollectionConfig = {
  slug: "membership-registrations",
  labels: {
    singular: "Membership Registration",
    plural: "Membership Registrations",
  },
  admin: {
    group: "Membership",
    description:
      "New member sign-ups from /membership — filter by sport to see registrants per activity",
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "sport", "phone", "icNumber", "createdAt", "actions"],
    listSearchableFields: ["fullName", "email", "phone", "icNumber", "addressLine", "address"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "actions",
      type: "ui",
      admin: {
        disableListColumn: false,
        components: {
          Cell: "@/payload/components/MembershipRowActions#MembershipRowActions",
        },
      },
      label: "Actions",
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Member details",
          fields: [
            {
              name: "fullName",
              type: "text",
              required: true,
              label: "Full name (as per IC)",
            },
            {
              name: "email",
              type: "email",
              required: true,
              label: "Email address",
            },
            {
              name: "icNumber",
              type: "text",
              required: true,
              label: "IC number",
              admin: {
                description: "Format: XXXXXX-XX-XXXX",
              },
            },
            {
              name: "phone",
              type: "text",
              required: true,
              label: "Phone (WhatsApp)",
            },
            {
              name: "sport",
              type: "select",
              required: true,
              options: sportOptions,
              admin: {
                description: "Main sport preference from the registration form",
              },
            },
            {
              name: "photo",
              type: "upload",
              relationTo: "media",
              label: "Profile picture",
            },
          ],
        },
        {
          label: "Address",
          fields: [
            {
              name: "addressLine",
              type: "text",
              required: true,
              label: "Address line (Bandar Putra Permai)",
            },
            {
              name: "address",
              type: "textarea",
              required: true,
              label: "Full address",
            },
          ],
        },
      ],
    },
  ],
};
