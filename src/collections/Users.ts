import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Admin User",
    plural: "Admin Users",
  },
  admin: {
    group: "Site",
    description: "People who can sign in to the CMS",
    useAsTitle: "email",
  },
  auth: true,
  fields: [],
};
