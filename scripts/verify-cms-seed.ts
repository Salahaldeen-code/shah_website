/**
 * Verify Neon CMS seed counts. Usage: npx payload run ./scripts/verify-cms-seed.ts
 */
import { getPayload } from "payload";
import config from "../src/payload.config.ts";

export async function script() {
  const payload = await getPayload({ config });
  const cols = [
    "programs",
    "activities",
    "gallery-albums",
    "committee-members",
    "media",
    "users",
  ] as const;

  console.log("Neon CMS counts:");
  for (const collection of cols) {
    const result = await payload.find({ collection, limit: 0 });
    console.log(`  ${collection}: ${result.totalDocs}`);
  }

  const activities = await payload.findGlobal({
    slug: "home-activities",
    locale: "en",
  });
  const settings = await payload.findGlobal({
    slug: "site-settings",
    locale: "en",
  });
  console.log(`  home-activities.title: ${activities.title}`);
  console.log(`  site-settings.name: ${settings.name}`);
}
