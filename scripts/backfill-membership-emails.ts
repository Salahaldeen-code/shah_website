/**
 * Backfill missing membership registration emails before making the field required.
 * Usage: npx payload backfill-membership-emails
 */
import { getPayload } from "payload";

import config from "../src/payload.config.ts";

const PLACEHOLDER_DOMAIN = "psr.local";

export async function script() {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "membership-registrations",
    limit: 1000,
    overrideAccess: true,
  });

  let updated = 0;

  for (const doc of docs) {
    const email = typeof doc.email === "string" ? doc.email.trim() : "";
    if (email) continue;

    const placeholder = `pending-${doc.id}@${PLACEHOLDER_DOMAIN}`;

    await payload.update({
      collection: "membership-registrations",
      id: doc.id,
      data: { email: placeholder },
      overrideAccess: true,
    });

    updated += 1;
    console.log(`Backfilled email for registration ${doc.id}: ${placeholder}`);
  }

  console.log(
    updated > 0
      ? `Backfilled ${updated} registration(s).`
      : "No registrations needed backfilling.",
  );
}
