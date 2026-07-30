import path from "path";
import { fileURLToPath } from "url";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Activities } from "./collections/Activities.ts";
import { Categories } from "./collections/Categories.ts";
import { CommitteeMembers } from "./collections/CommitteeMembers.ts";
import { MembershipRegistrations } from "./collections/MembershipRegistrations.ts";
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
import { applyAdminNavOrder } from "./payload/admin/navLabels.ts";
import { cloudinaryStorage } from "./payload/storage/cloudinary.ts";
import { readCloudinaryCredentials } from "./payload/storage/credentials.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const postgresUrl = (() => {
  const raw = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (
      url.hostname.endsWith(".neon.tech") &&
      !url.hostname.includes("-pooler.")
    ) {
      url.hostname = url.hostname.replace(/^([^.]+)/, "$1-pooler");
    }
    return url.toString();
  } catch {
    return raw;
  }
})();
const isVercel = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === "production";

if (isVercel && !postgresUrl) {
  throw new Error(
    "Missing POSTGRES_URL (or DATABASE_URL). Set it in the Vercel project env vars — SQLite cannot run on Vercel.",
  );
}

if (isVercel && !process.env.PAYLOAD_SECRET) {
  throw new Error(
    "Missing PAYLOAD_SECRET. Set a long random string in the Vercel project env vars.",
  );
}

const cloudinaryCredentials = readCloudinaryCredentials();
const blobToken = cloudinaryCredentials
  ? undefined
  : process.env.BLOB_READ_WRITE_TOKEN;

const collections = [
  Programs,
  Categories,
  Activities,
  CommitteeMembers,
  MembershipRegistrations,
  Media,
  Users,
].map((collection) => {
  const ordered = applyAdminNavOrder(collection);
  return {
    ...ordered,
    disableDuplicate: true,
    admin: {
      ...ordered.admin,
      hideAPIURL: true,
      disableCopyToLocale: true,
    },
  };
});

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
].map((global) => {
  const ordered = applyAdminNavOrder(global);
  return {
    ...ordered,
    admin: {
      ...ordered.admin,
      hideAPIURL: true,
      disableCopyToLocale: true,
    },
  };
});

export default buildConfig({
  serverURL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (isVercel ? "https://shah-website-ayc1.vercel.app" : "http://localhost:3000"),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: "@/payload/components/AdminLogo#AdminLogo",
        Icon: "@/payload/components/AdminIcon#AdminIcon",
      },
    },
    meta: {
      titleSuffix: " — Persatuan Sukan & Rekreasi",
      icons: [
        {
          type: "image/png",
          rel: "icon",
          url: "/images/app/logo-psr.png",
        },
      ],
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
          max: 10,
          idleTimeoutMillis: 10_000,
          connectionTimeoutMillis: 10_000,
        },
        push: !isProd,
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_URL || "file:./payload.db",
        },
        // Local DB already exists — skip schema push on every dev boot.
        push: false,
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
    {
      key: "backfill-membership-emails",
      scriptPath: path.resolve(
        dirname,
        "../scripts/backfill-membership-emails.ts",
      ),
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
