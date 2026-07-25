/**
 * CMS smoke test via public REST API + frontend HTML checks.
 * Run: npx tsx --env-file=.env.local scripts/cms-smoke-test.ts
 *
 * Does not require admin login (collections/globals have public read).
 * Write tests are covered separately via admin UI when credentials are available.
 */
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Result = { name: string; pass: boolean; detail?: string };
const results: Result[] = [];

function ok(name: string, pass: boolean, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name}${detail ? ` — ${detail}` : ""}`);
}

async function getJson(path: string) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function pageIncludes(path: string, needle: string) {
  const res = await fetch(`${BASE}${path}`);
  const html = await res.text();
  return { status: res.status, has: html.includes(needle), html };
}

async function main() {
  // Health
  {
    const res = await fetch(`${BASE}/`);
    ok("Dev server reachable", res.ok, `status=${res.status}`);
  }

  const globals = [
    "home-hero",
    "home-editorial",
    "home-showcase",
    "home-impact",
    "programs-ui",
    "home-activities",
    "home-footer",
    "about-page",
    "gallery-ui",
    "contact-page",
    "site-settings",
  ];

  const globalDocs: Record<string, Record<string, unknown>> = {};

  for (const slug of globals) {
    const { res, data } = await getJson(
      `/api/globals/${slug}?locale=en&depth=1`,
    );
    globalDocs[slug] = data as Record<string, unknown>;
    ok(
      `READ global:${slug}`,
      res.ok,
      res.ok ? `ok` : `status=${res.status} ${JSON.stringify(data?.errors ?? data).slice(0, 120)}`,
    );
  }

  const collections = [
    "programs",
    "activities",
    "committee-members",
    "gallery-albums",
    "media",
  ];

  const collectionDocs: Record<
    string,
    { docs: Record<string, unknown>[]; totalDocs: number }
  > = {};

  for (const slug of collections) {
    const { res, data } = await getJson(
      `/api/${slug}?locale=en&limit=10&depth=1`,
    );
    collectionDocs[slug] = data as never;
    ok(
      `READ collection:${slug}`,
      res.ok,
      res.ok
        ? `totalDocs=${data.totalDocs ?? data.docs?.length ?? 0}`
        : `status=${res.status}`,
    );
  }

  // Content presence (seeded?)
  ok(
    "DATA programs has rows",
    (collectionDocs.programs?.totalDocs ?? 0) > 0,
    `total=${collectionDocs.programs?.totalDocs ?? 0}`,
  );
  ok(
    "DATA activities has rows",
    (collectionDocs.activities?.totalDocs ?? 0) > 0,
    `total=${collectionDocs.activities?.totalDocs ?? 0}`,
  );
  ok(
    "DATA gallery-albums has rows",
    (collectionDocs["gallery-albums"]?.totalDocs ?? 0) > 0,
    `total=${collectionDocs["gallery-albums"]?.totalDocs ?? 0}`,
  );
  ok(
    "DATA committee-members has rows",
    (collectionDocs["committee-members"]?.totalDocs ?? 0) > 0,
    `total=${collectionDocs["committee-members"]?.totalDocs ?? 0}`,
  );
  ok(
    "DATA media has files",
    (collectionDocs.media?.totalDocs ?? 0) > 0,
    `total=${collectionDocs.media?.totalDocs ?? 0}`,
  );

  // Programs have images populated
  const progWithImage = collectionDocs.programs?.docs?.find(
    (d) => d.image && typeof d.image === "object",
  );
  ok(
    "DATA programs.image populated at depth=1",
    Boolean(progWithImage),
    progWithImage
      ? `url=${(progWithImage.image as { url?: string }).url ?? "n/a"}`
      : "image not populated / missing",
  );

  // Editable globals have expected fields
  const fieldChecks: [string, string][] = [
    ["home-editorial", "topText"],
    ["home-showcase", "brandLine1"],
    ["home-impact", "lineA"],
    ["programs-ui", "title"],
    ["home-activities", "title"],
    ["about-page", "title"],
    ["gallery-ui", "title"],
    ["contact-page", "title"],
    ["site-settings", "name"],
  ];

  for (const [slug, field] of fieldChecks) {
    const val = globalDocs[slug]?.[field];
    ok(
      `FIELD ${slug}.${field}`,
      typeof val === "string" && val.length > 0,
      typeof val === "string"
        ? `value="${val.slice(0, 60)}"`
        : `type=${typeof val}`,
    );
  }

  // Pages load
  for (const path of [
    "/",
    "/about",
    "/contact",
    "/gallery",
    "/membership",
    "/admin",
  ]) {
    const res = await fetch(`${BASE}${path}`);
    ok(`PAGE ${path}`, res.ok || (res.status >= 300 && res.status < 400), `status=${res.status}`);
  }

  // Site wiring — SSR HTML contains CMS strings
  const editorialTop = globalDocs["home-editorial"]?.topText;
  if (typeof editorialTop === "string" && editorialTop) {
    const p = await pageIncludes("/", editorialTop);
    ok(
      "WIRE home ↔ Editorial topText",
      p.has,
      p.has ? "found" : "not in SSR HTML",
    );
  }

  const showcaseLine = globalDocs["home-showcase"]?.brandLine1;
  if (typeof showcaseLine === "string" && showcaseLine) {
    const p = await pageIncludes("/", showcaseLine);
    ok(
      "WIRE home ↔ Showcase brandLine1",
      p.has,
      p.has ? "found" : "not in SSR HTML",
    );
  }

  const impactLine = globalDocs["home-impact"]?.lineA;
  if (typeof impactLine === "string" && impactLine) {
    const p = await pageIncludes("/", impactLine);
    ok(
      "WIRE home ↔ Impact lineA",
      p.has,
      p.has ? "found" : "not in SSR HTML",
    );
  }

  const programsUiTitle = globalDocs["programs-ui"]?.title;
  if (typeof programsUiTitle === "string" && programsUiTitle) {
    const p = await pageIncludes("/", programsUiTitle);
    ok(
      "WIRE home ↔ Programs UI title",
      p.has,
      p.has ? "found" : "not in SSR HTML",
    );
  }

  const activitiesTitle = globalDocs["home-activities"]?.title;
  if (typeof activitiesTitle === "string" && activitiesTitle) {
    const p = await pageIncludes("/", activitiesTitle);
    ok(
      "WIRE home ↔ Activities title",
      p.has,
      p.has ? "found" : "not in SSR HTML (may be client-only)",
    );
  }

  const programTitle = collectionDocs.programs?.docs?.find(
    (d) => typeof d.title === "string" && !String(d.title).includes("&"),
  )?.title;
  if (typeof programTitle === "string" && programTitle) {
    const p = await pageIncludes("/", programTitle);
    ok(
      "WIRE home ↔ Program title",
      p.has,
      p.has ? `found: ${programTitle}` : "not in SSR HTML (may be client-only)",
    );
  }

  const activityCardTitle = collectionDocs.activities?.docs?.[0]?.title;
  if (typeof activityCardTitle === "string" && activityCardTitle) {
    const p = await pageIncludes("/", activityCardTitle);
    ok(
      "WIRE home ↔ Activity card title",
      p.has,
      p.has
        ? `found: ${activityCardTitle}`
        : "not in SSR HTML (may be client-only)",
    );
  }

  const aboutTitle = globalDocs["about-page"]?.title;
  if (typeof aboutTitle === "string" && aboutTitle) {
    const p = await pageIncludes("/about", aboutTitle);
    ok("WIRE /about ↔ About title", p.has, p.has ? "found" : "missing");
  }

  const memberName = collectionDocs["committee-members"]?.docs?.[0]?.name;
  if (typeof memberName === "string" && memberName) {
    const p = await pageIncludes("/about", memberName);
    ok(
      "WIRE /about ↔ Committee member",
      p.has,
      p.has ? `found: ${memberName}` : "missing",
    );
  }

  const contactTitle = globalDocs["contact-page"]?.title;
  if (typeof contactTitle === "string" && contactTitle) {
    const p = await pageIncludes("/contact", contactTitle);
    ok("WIRE /contact ↔ Contact title", p.has, p.has ? "found" : "missing");
  }

  const galleryTitle = globalDocs["gallery-ui"]?.title;
  if (typeof galleryTitle === "string" && galleryTitle) {
    const p = await pageIncludes("/gallery", galleryTitle);
    ok("WIRE /gallery ↔ Gallery UI title", p.has, p.has ? "found" : "missing");
  }

  const albumTitle = collectionDocs["gallery-albums"]?.docs?.find(
    (d) => typeof d.title === "string" && !String(d.title).includes("&"),
  )?.title;
  if (typeof albumTitle === "string" && albumTitle) {
    const p = await pageIncludes("/gallery", albumTitle);
    ok(
      "WIRE /gallery ↔ Album title",
      p.has,
      p.has ? `found: ${albumTitle}` : "missing",
    );
  }

  const settingsName = globalDocs["site-settings"]?.name;
  if (typeof settingsName === "string" && settingsName) {
    const home = await pageIncludes("/", settingsName);
    const contact = await pageIncludes("/contact", settingsName);
    ok(
      "WIRE site-settings.name",
      home.has || contact.has,
      home.has || contact.has
        ? "found on a page"
        : "NOT wired — Site Settings do not drive the public site yet",
    );
  }

  ok(
    "INFO home-hero preview-only",
    true,
    "no editable site fields (carousel still in code)",
  );
  ok(
    "INFO home-footer preview-only",
    true,
    "no editable site fields (social footer still in code)",
  );

  const failed = results.filter((r) => !r.pass);
  console.log("\n==== SUMMARY ====");
  console.log(
    `Total: ${results.length}  Pass: ${results.length - failed.length}  Fail: ${failed.length}`,
  );
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(` - ${f.name} — ${f.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error("FATAL", error);
  process.exit(2);
});
