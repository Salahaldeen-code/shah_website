import { PREFERENCE_KEYS } from "payload/shared";
import type { PayloadRequest } from "payload";
import { cache } from "react";

export const getNavPrefs = cache(async (req: PayloadRequest) => {
  if (!req?.user?.collection) return null;

  try {
    return await req.payload
      .find({
        collection: "payload-preferences",
        depth: 0,
        limit: 1,
        pagination: false,
        req,
        where: {
          and: [
            {
              key: {
                equals: PREFERENCE_KEYS.NAV,
              },
            },
            {
              "user.relationTo": {
                equals: req.user.collection,
              },
            },
            {
              "user.value": {
                equals: req.user.id,
              },
            },
          ],
        },
      })
      .then((res) => res?.docs?.[0]?.value ?? null);
  } catch (error) {
    // If preferences rel schema is temporarily out-of-sync, do not block admin nav.
    req.payload.logger.warn(
      {
        err: error,
      },
      "Skipping nav preferences due to query failure",
    );
    return null;
  }
});
