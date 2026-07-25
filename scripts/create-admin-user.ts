/**
 * Create or reset a Payload admin user.
 * Usage: npx payload create-admin
 */
import { getPayload } from "payload";

import config from "../src/payload.config.ts";

export async function script() {
  const email = process.env.ADMIN_EMAIL || "wasalah@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "1234";

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      collection: "users",
      id: existing.docs[0].id,
      data: { password },
    });
    console.log(`Updated password for existing user: ${email}`);
  } else {
    await payload.create({
      collection: "users",
      data: { email, password },
    });
    console.log(`Created user: ${email}`);
  }
}
