import { PREFERENCE_KEYS } from "payload/shared";
import type { PayloadRequest } from "payload";
import { cache } from "react";

export const getNavPrefs = cache(async (req: PayloadRequest) => {
  return req?.user?.collection
    ? await req.payload
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
                  equals: req?.user?.id,
                },
              },
            ],
          },
        })
        ?.then((res) => res?.docs?.[0]?.value)
    : null;
});
