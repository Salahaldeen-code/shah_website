import path from "path";
import { fileURLToPath } from "url";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Activities } from "./collections/Activities.ts";
import { CommitteeMembers } from "./collections/CommitteeMembers.ts";
import { GalleryAlbums } from "./collections/GalleryAlbums.ts";
import { Media } from "./collections/Media.ts";
import { Programs } from "./collections/Programs.ts";
import { Users } from "./collections/Users.ts";
import { AboutPage } from "./globals/AboutPage.ts";
import { ContactPage } from "./globals/ContactPage.ts";
import { GalleryUi } from "./globals/GalleryUi.ts";
import { HomeActivities } from "./globals/HomeActivities.ts";
import { HomeEditorial } from "./globals/HomeEditorial.ts";
import { HomeFooter } from "./globals/HomeFooter.ts";
import { HomeHero } from "./globals/HomeHero.ts";
import { HomeImpact } from "./globals/HomeImpact.ts";
import { HomeShowcase } from "./globals/HomeShowcase.ts";
import { ProgramsUi } from "./globals/ProgramsUi.ts";
import { SiteSettings } from "./globals/SiteSettings.ts";
import {
  cloudinaryStorage,
  readCloudinaryCredentials,
} from "./payload/storage/cloudinary.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const cloudinaryCredentials = readCloudinaryCredentials();
const blobToken = cloudinaryCredentials
  ? undefined
  : process.env.BLOB_READ_WRITE_TOKEN;

const editBesideSave =
  "@/payload/components/EditBesideSave#EditBesideSave";

const collections = [
  Programs,
  Activities,
  CommitteeMembers,
  GalleryAlbums,
  Media,
  Users,
].map((collection) => ({
  ...collection,
  disableDuplicate: true,
  admin: {
    ...collection.admin,
    hideAPIURL: true,
    disableCopyToLocale: true,
    components: {
      ...collection.admin?.components,
      edit: {
        ...collection.admin?.components?.edit,
        beforeDocumentControls: [editBesideSave],
      },
    },
  },
}));

const globals = [
  HomeHero,
  HomeEditorial,
  HomeShowcase,
  HomeImpact,
  ProgramsUi,
  HomeActivities,
  HomeFooter,
  AboutPage,
  GalleryUi,
  ContactPage,
  SiteSettings,
].map((global) => ({
  ...global,
  admin: {
    ...global.admin,
    hideAPIURL: true,
    disableCopyToLocale: true,
    components: {
      ...global.admin?.components,
      elements: {
        ...global.admin?.components?.elements,
        beforeDocumentControls: [editBesideSave],
      },
    },
  },
}));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: "@/payload/components/SortedNav#SortedNav",
    },
    meta: {
      titleSuffix: " — PSR CMS",
    },
  },
  collections,
  globals,
  secret: process.env.PAYLOAD_SECRET || "CHANGE_ME_IN_PRODUCTION",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresUrl
    ? vercelPostgresAdapter({
        pool: {
          connectionString: postgresUrl,
        },
        // Push schema on boot until formal migrations are committed
        push: true,
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_URL || "file:./payload.db",
        },
      }),
  localization: {
    locales: [
      { code: "en", label: "English" },
      { code: "ms", label: "Bahasa Melayu" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  sharp,
  bin: [
    {
      key: "seed",
      scriptPath: path.resolve(dirname, "../scripts/seed-cms.ts"),
    },
    {
      key: "create-admin",
      scriptPath: path.resolve(dirname, "../scripts/create-admin-user.ts"),
    },
  ],
  plugins: [
    ...(cloudinaryCredentials
      ? [
          cloudinaryStorage({
            collections: ["media"],
            credentials: cloudinaryCredentials,
          }),
        ]
      : []),
    ...(blobToken
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: blobToken,
          }),
        ]
      : []),
  ],
});
