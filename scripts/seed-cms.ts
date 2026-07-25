/**
 * One-time CMS seed from existing dictionaries + config.
 * Usage: npm run cms:seed
 *
 * Local uploads go to ./media (or Vercel Blob when BLOB_READ_WRITE_TOKEN is set).
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { getPayload } from "payload";

import config from "../src/payload.config.ts";
import { activityPairs } from "../src/config/activities.ts";
import { committeeMembers } from "../src/config/committee.ts";
import { galleryAlbums } from "../src/config/gallery.ts";
import { impactImages } from "../src/config/impact.ts";
import { programs } from "../src/config/programs.ts";
import { showcaseGridImages, showcaseSideImages } from "../src/config/showcase.ts";
import en from "../src/dictionaries/en.json" with { type: "json" };
import ms from "../src/dictionaries/ms.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const mediaCache = new Map<string, number | string>();

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  publicPath: string,
  alt: string,
) {
  const normalized = publicPath.startsWith("/")
    ? publicPath
    : `/${publicPath}`;
  const cached = mediaCache.get(normalized);
  if (cached) return cached;

  if (normalized.startsWith("http")) {
    // Remote URLs (e.g. Unsplash) — skip upload; callers should use placeholders.
    return null;
  }

  const absolute = path.join(publicDir, normalized.replace(/^\//, ""));
  if (!(await fileExists(absolute))) {
    console.warn(`  skip missing media: ${normalized}`);
    return null;
  }

  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: path.basename(absolute) } },
    limit: 1,
  });
  if (existing.docs[0]) {
    mediaCache.set(normalized, existing.docs[0].id);
    return existing.docs[0].id;
  }

  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath: absolute,
    locale: "en",
  });

  await payload.update({
    collection: "media",
    id: doc.id,
    locale: "ms",
    data: { alt },
  });

  mediaCache.set(normalized, doc.id);
  return doc.id;
}

async function clearCollection(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug:
    | "programs"
    | "gallery-albums"
    | "activities"
    | "committee-members",
) {
  const existing = await payload.find({
    collection: slug,
    limit: 200,
    depth: 0,
  });
  for (const doc of existing.docs) {
    await payload.delete({ collection: slug, id: doc.id });
  }
}

async function seed() {
  console.log("Seeding Payload CMS…");
  const payload = await getPayload({ config });

  // --- Media used by content ---
  const heroPaths = [
    "/images/hero/image1.jpg",
    "/images/hero/image2.jpg",
    "/images/hero/image3.jpg",
    "/images/hero/image4.jpg",
    "/images/hero/image5.jpg",
    "/images/hero/image6.jpg",
    "/images/app/impact-triathlon.png",
    "/images/app/badminton-cutout.png",
    "/images/app/contact.jpg",
    "/videos/activities/outdoor.mp4",
  ];

  for (const p of heroPaths) {
    await ensureMedia(payload, p, path.basename(p));
  }

  for (const album of galleryAlbums) {
    await ensureMedia(payload, album.cover, album.slug);
    for (const photo of album.photos) {
      await ensureMedia(payload, photo, `${album.slug}-photo`);
    }
  }

  // --- Programs ---
  await clearCollection(payload, "programs");
  for (const program of programs) {
    const imageId = await ensureMedia(
      payload,
      program.image,
      en.programs.items[program.titleKey],
    );
    if (!imageId) continue;

    const created = await payload.create({
      collection: "programs",
      locale: "en",
      data: {
        title: en.programs.items[program.titleKey],
        details: en.programs.details[program.titleKey],
        category: program.categoryKey,
        venue: en.programs.venues[program.venueKey],
        image: imageId,
        start: program.start,
        end: program.end,
      },
    });

    await payload.update({
      collection: "programs",
      id: created.id,
      locale: "ms",
      data: {
        title: ms.programs.items[program.titleKey],
        details: ms.programs.details[program.titleKey],
        venue: ms.programs.venues[program.venueKey],
      },
    });
  }
  console.log(`  programs: ${programs.length}`);

  // --- Gallery ---
  await clearCollection(payload, "gallery-albums");
  for (const album of galleryAlbums) {
    const coverId = await ensureMedia(payload, album.cover, album.slug);
    if (!coverId) continue;

    const photoIds: { image: number | string }[] = [];
    for (const photo of album.photos) {
      const id = await ensureMedia(payload, photo, `${album.slug}-photo`);
      if (id) photoIds.push({ image: id });
    }

    const albumCopy = en.gallery.albums[album.slug];
    const albumCopyMs = ms.gallery.albums[album.slug];

    const created = await payload.create({
      collection: "gallery-albums",
      locale: "en",
      data: {
        title: albumCopy.title,
        slug: album.slug,
        summary: albumCopy.summary,
        description: albumCopy.description,
        date: album.date,
        venue: en.programs.venues[album.venueKey],
        category: album.categoryKey,
        cover: coverId,
        photos: photoIds,
      },
    });

    await payload.update({
      collection: "gallery-albums",
      id: created.id,
      locale: "ms",
      data: {
        title: albumCopyMs.title,
        summary: albumCopyMs.summary,
        description: albumCopyMs.description,
        venue: ms.programs.venues[album.venueKey],
      },
    });
  }
  console.log(`  gallery-albums: ${galleryAlbums.length}`);

  // --- Activities ---
  await clearCollection(payload, "activities");
  let order = 0;
  for (const pair of activityPairs) {
    for (const item of pair.items) {
      const imageId = await ensureMedia(
        payload,
        item.image,
        en.activities.items[item.titleKey],
      );
      if (!imageId) continue;
      const videoId = await ensureMedia(
        payload,
        item.video,
        `${item.titleKey}-video`,
      );

      const created = await payload.create({
        collection: "activities",
        locale: "en",
        data: {
          title: en.activities.items[item.titleKey],
          tag: item.tagKey,
          slot: item.slot,
          pair: pair.id,
          order: order++,
          image: imageId,
          ...(videoId ? { video: videoId } : {}),
        },
      });

      await payload.update({
        collection: "activities",
        id: created.id,
        locale: "ms",
        data: {
          title: ms.activities.items[item.titleKey],
        },
      });
    }
  }
  console.log(`  activities: ${order}`);

  // --- Committee ---
  await clearCollection(payload, "committee-members");
  const placeholder = await ensureMedia(
    payload,
    "/images/hero/image1.jpg",
    "Committee member",
  );
  for (let i = 0; i < committeeMembers.length; i++) {
    const member = committeeMembers[i]!;
    const imageId =
      (member.image.startsWith("http")
        ? placeholder
        : await ensureMedia(payload, member.image, member.name)) ||
      placeholder;
    if (!imageId) continue;

    const roleMs =
      (
        {
          President: "Presiden",
          "Deputy President": "Timbalan Presiden",
          "Honorary Secretary": "Setiausaha Kehormat",
          "Honorary Treasurer": "Bendahari Kehormat",
        } as Record<string, string>
      )[member.role] || member.role;

    const created = await payload.create({
      collection: "committee-members",
      locale: "en",
      data: {
        name: member.name,
        role: member.role,
        image: imageId,
        order: i,
        social: member.social || {},
      },
    });

    await payload.update({
      collection: "committee-members",
      id: created.id,
      locale: "ms",
      data: { role: roleMs },
    });
  }
  console.log(`  committee-members: ${committeeMembers.length}`);

  // --- Globals ---
  const sideIds = await Promise.all(
    [
      ...showcaseSideImages.left,
      ...showcaseSideImages.right,
    ].map(async (img) => {
      const id = await ensureMedia(payload, img.src, img.alt);
      return id ? { image: id, alt: img.alt } : null;
    }),
  );

  const gridIds = await Promise.all(
    showcaseGridImages.map(async (img) => {
      const id = await ensureMedia(payload, img.src, img.alt);
      return id ? { image: id, alt: img.alt } : null;
    }),
  );

  await payload.updateGlobal({
    slug: "home-showcase",
    locale: "en",
    data: {
      ...en.showcase,
      sideImages: sideIds.filter(Boolean),
      gridImages: gridIds.filter(Boolean),
    },
  });
  await payload.updateGlobal({
    slug: "home-showcase",
    locale: "ms",
    data: { ...ms.showcase },
  });

  const bg = await ensureMedia(
    payload,
    impactImages.background.src,
    impactImages.background.alt,
  );
  const fl = await ensureMedia(
    payload,
    impactImages.floatLeft.src,
    impactImages.floatLeft.alt,
  );
  const fr = await ensureMedia(
    payload,
    impactImages.floatRight.src,
    impactImages.floatRight.alt,
  );

  await payload.updateGlobal({
    slug: "home-impact",
    locale: "en",
    data: {
      ...en.impact,
      ...(bg ? { background: bg } : {}),
      ...(fl ? { floatLeft: fl } : {}),
      ...(fr ? { floatRight: fr } : {}),
    },
  });
  await payload.updateGlobal({
    slug: "home-impact",
    locale: "ms",
    data: { ...ms.impact },
  });

  await payload.updateGlobal({
    slug: "home-editorial",
    locale: "en",
    data: { ...en.editorial },
  });
  await payload.updateGlobal({
    slug: "home-editorial",
    locale: "ms",
    data: { ...ms.editorial },
  });

  const membershipImg = await ensureMedia(
    payload,
    "/images/app/badminton-cutout.png",
    en.activities.membership.imageAlt,
  );

  await payload.updateGlobal({
    slug: "home-activities",
    locale: "en",
    data: {
      title: en.activities.title,
      description: en.activities.description,
      membership: {
        ...en.activities.membership,
        ...(membershipImg ? { image: membershipImg } : {}),
      },
    },
  });
  await payload.updateGlobal({
    slug: "home-activities",
    locale: "ms",
    data: {
      title: ms.activities.title,
      description: ms.activities.description,
      membership: { ...ms.activities.membership },
    },
  });

  await payload.updateGlobal({
    slug: "programs-ui",
    locale: "en",
    data: {
      title: en.programs.title,
      subtitle: en.programs.subtitle,
      empty: en.programs.empty,
      join: en.programs.join,
      joinNow: en.programs.joinNow,
      close: en.programs.close,
      viewAll: en.programs.viewAll,
      showLess: en.programs.showLess,
      filters: en.programs.filters,
    },
  });
  await payload.updateGlobal({
    slug: "programs-ui",
    locale: "ms",
    data: {
      title: ms.programs.title,
      subtitle: ms.programs.subtitle,
      empty: ms.programs.empty,
      join: ms.programs.join,
      joinNow: ms.programs.joinNow,
      close: ms.programs.close,
      viewAll: ms.programs.viewAll,
      showLess: ms.programs.showLess,
      filters: ms.programs.filters,
    },
  });

  await payload.updateGlobal({
    slug: "gallery-ui",
    locale: "en",
    data: {
      title: en.gallery.title,
      subtitle: en.gallery.subtitle,
      viewAlbum: en.gallery.viewAlbum,
      backToGallery: en.gallery.backToGallery,
      photosHeading: en.gallery.photosHeading,
      photoCount: en.gallery.photoCount,
    },
  });
  await payload.updateGlobal({
    slug: "gallery-ui",
    locale: "ms",
    data: {
      title: ms.gallery.title,
      subtitle: ms.gallery.subtitle,
      viewAlbum: ms.gallery.viewAlbum,
      backToGallery: ms.gallery.backToGallery,
      photosHeading: ms.gallery.photosHeading,
      photoCount: ms.gallery.photoCount,
    },
  });

  const aboutHero = await ensureMedia(
    payload,
    "/images/hero/image5.jpg",
    "About hero",
  );
  const aboutStory = await ensureMedia(
    payload,
    "/images/hero/image6.jpg",
    "About story",
  );

  await payload.updateGlobal({
    slug: "about-page",
    locale: "en",
    data: {
      eyebrow: en.aboutPage.eyebrow,
      title: en.aboutPage.title,
      lead: en.aboutPage.lead,
      storyTitle: en.aboutPage.storyTitle,
      story: en.aboutPage.story,
      missionTitle: en.aboutPage.missionTitle,
      mission: en.aboutPage.mission,
      visionTitle: en.aboutPage.visionTitle,
      vision: en.aboutPage.vision,
      committeeTitle: en.aboutPage.committeeTitle,
      committeeSubtitle: en.aboutPage.committeeSubtitle,
      pillarsTitle: en.aboutPage.pillarsTitle,
      pillars: [
        { key: "community", ...en.aboutPage.pillars.community },
        { key: "access", ...en.aboutPage.pillars.access },
        { key: "active", ...en.aboutPage.pillars.active },
      ],
      ctaTitle: en.aboutPage.ctaTitle,
      ctaBody: en.aboutPage.ctaBody,
      ctaMembership: en.aboutPage.ctaMembership,
      ctaActivities: en.aboutPage.ctaActivities,
      ...(aboutHero ? { heroImage: aboutHero } : {}),
      ...(aboutStory ? { storyImage: aboutStory } : {}),
    },
  });
  await payload.updateGlobal({
    slug: "about-page",
    locale: "ms",
    data: {
      eyebrow: ms.aboutPage.eyebrow,
      title: ms.aboutPage.title,
      lead: ms.aboutPage.lead,
      storyTitle: ms.aboutPage.storyTitle,
      story: ms.aboutPage.story,
      missionTitle: ms.aboutPage.missionTitle,
      mission: ms.aboutPage.mission,
      visionTitle: ms.aboutPage.visionTitle,
      vision: ms.aboutPage.vision,
      committeeTitle: ms.aboutPage.committeeTitle,
      committeeSubtitle: ms.aboutPage.committeeSubtitle,
      pillarsTitle: ms.aboutPage.pillarsTitle,
      pillars: [
        { key: "community", ...ms.aboutPage.pillars.community },
        { key: "access", ...ms.aboutPage.pillars.access },
        { key: "active", ...ms.aboutPage.pillars.active },
      ],
      ctaTitle: ms.aboutPage.ctaTitle,
      ctaBody: ms.aboutPage.ctaBody,
      ctaMembership: ms.aboutPage.ctaMembership,
      ctaActivities: ms.aboutPage.ctaActivities,
    },
  });

  const contactImg = await ensureMedia(
    payload,
    "/images/app/contact.jpg",
    en.contactPage.imageAlt,
  );

  await payload.updateGlobal({
    slug: "contact-page",
    locale: "en",
    data: {
      eyebrow: en.contactPage.eyebrow,
      title: en.contactPage.title,
      lead: en.contactPage.lead,
      detailsTitle: en.contactPage.detailsTitle,
      detailsLead: en.contactPage.detailsLead,
      imageAlt: en.contactPage.imageAlt,
      form: {
        title: en.contactPage.form.title,
        subtitle: en.contactPage.form.subtitle,
        name: en.contactPage.form.name,
        namePlaceholder: en.contactPage.form.namePlaceholder,
        email: en.contactPage.form.email,
        emailPlaceholder: en.contactPage.form.emailPlaceholder,
        phone: en.contactPage.form.phone,
        phonePlaceholder: en.contactPage.form.phonePlaceholder,
        subject: en.contactPage.form.subject,
        subjectPlaceholder: en.contactPage.form.subjectPlaceholder,
        message: en.contactPage.form.message,
        messagePlaceholder: en.contactPage.form.messagePlaceholder,
        submit: en.contactPage.form.submit,
        submitting: en.contactPage.form.submitting,
        note: en.contactPage.form.note,
        successTitle: en.contactPage.form.successTitle,
        successBody: en.contactPage.form.successBody,
        sendAnother: en.contactPage.form.sendAnother,
      },
      ...(contactImg ? { image: contactImg } : {}),
    },
  });
  await payload.updateGlobal({
    slug: "contact-page",
    locale: "ms",
    data: {
      eyebrow: ms.contactPage.eyebrow,
      title: ms.contactPage.title,
      lead: ms.contactPage.lead,
      detailsTitle: ms.contactPage.detailsTitle,
      detailsLead: ms.contactPage.detailsLead,
      imageAlt: ms.contactPage.imageAlt,
      form: {
        title: ms.contactPage.form.title,
        subtitle: ms.contactPage.form.subtitle,
        name: ms.contactPage.form.name,
        namePlaceholder: ms.contactPage.form.namePlaceholder,
        email: ms.contactPage.form.email,
        emailPlaceholder: ms.contactPage.form.emailPlaceholder,
        phone: ms.contactPage.form.phone,
        phonePlaceholder: ms.contactPage.form.phonePlaceholder,
        subject: ms.contactPage.form.subject,
        subjectPlaceholder: ms.contactPage.form.subjectPlaceholder,
        message: ms.contactPage.form.message,
        messagePlaceholder: ms.contactPage.form.messagePlaceholder,
        submit: ms.contactPage.form.submit,
        submitting: ms.contactPage.form.submitting,
        note: ms.contactPage.form.note,
        successTitle: ms.contactPage.form.successTitle,
        successBody: ms.contactPage.form.successBody,
        sendAnother: ms.contactPage.form.sendAnother,
      },
    },
  });

  await payload.updateGlobal({
    slug: "site-settings",
    locale: "en",
    data: {
      name: "Persatuan Sukan & Rekreasi",
      description:
        "Community sports and recreation association — programs, activities, and membership.",
      email: "hello@psr.example",
      phoneDisplay: "+60 12-345 6789",
      phoneTel: "+60123456789",
      whatsappDisplay: "+60 12-345 6789",
      whatsappDigits: "60123456789",
      addressLines: [
        { line: "Community Sports Hub" },
        { line: "Malaysia" },
      ],
      hours: [
        { days: "Mon–Fri", time: "9:00 – 18:00" },
        { days: "Sat–Sun", time: "8:00 – 17:00" },
      ],
    },
  });
  await payload.updateGlobal({
    slug: "site-settings",
    locale: "ms",
    data: {
      name: "Persatuan Sukan & Rekreasi",
      description:
        "Persatuan sukan dan rekreasi komuniti — program, aktiviti, dan keahlian.",
    },
  });

  console.log("Seed complete. Open /admin to create the first user and edit content.");
}

export async function script() {
  await seed();
}