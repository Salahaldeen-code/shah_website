import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

function bumpCache() {
  try {
    // Lazy-load so Payload CLI can import collection configs without Next.js.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { revalidatePath, revalidateTag } = require("next/cache") as typeof import("next/cache");
    revalidateTag("cms", "max");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/gallery");
    revalidatePath("/membership");
  } catch {
    // Cache revalidation is unavailable outside Next.js request context (e.g. seed scripts).
  }
}

export const revalidateContent: CollectionAfterChangeHook = ({ doc }) => {
  bumpCache();
  return doc;
};

export const revalidateContentDelete: CollectionAfterDeleteHook = ({ doc }) => {
  bumpCache();
  return doc;
};

export const revalidateGlobals: GlobalAfterChangeHook = ({ doc }) => {
  bumpCache();
  return doc;
};
