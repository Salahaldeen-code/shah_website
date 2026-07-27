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
import { heroShutterConfig, heroSlides } from "../src/config/carousel.ts";
import { committeeMembers } from "../src/config/committee.ts";
import { galleryAlbums } from "../src/config/gallery.ts";
import { impactImages } from "../src/config/impact.ts";
import { defaultPartnerLogos } from "../src/config/partners.ts";
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
  slug: "programs" | "categories" | "activities" | "committee-members",
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
    "/images/app/MY.jpg",
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

  // --- Categories (Active Life collage + activity taxonomy) ---
  await clearCollection(payload, "categories");
  const categorySeed = [
    ...showcaseSideImages.left,
    ...showcaseSideImages.right,
    ...showcaseGridImages.slice(0, 4),
  ];
  const categoryIds: (number | string)[] = [];
  const categoryByTag: Partial<
    Record<"outdoor" | "community" | "kids" | "wellness", number | string>
  > = {};

  for (let i = 0; i < categorySeed.length; i += 1) {
    const img = categorySeed[i]!;
    const imageId = await ensureMedia(payload, img.src, img.alt);
    if (!imageId) continue;

    const titleEn =
      i < 4
        ? (["Outdoor", "Community", "Kids", "Wellness"] as const)[i]!
        : img.alt || `Category ${i + 1}`;
    const titleMs =
      i < 4
        ? (["Luar", "Komuniti", "Kanak-kanak", "Kesejahteraan"] as const)[i]!
        : img.alt || `Kategori ${i + 1}`;

    const created = await payload.create({
      collection: "categories",
      locale: "en",
      data: {
        title: titleEn,
        image: imageId,
        order: i,
      },
    });
    await payload.update({
      collection: "categories",
      id: created.id,
      locale: "ms",
      data: { title: titleMs },
    });

    categoryIds.push(created.id);
    if (i < 4) {
      const keys = ["outdoor", "community", "kids", "wellness"] as const;
      categoryByTag[keys[i]!] = created.id;
    }
  }
  console.log(`  categories: ${categoryIds.length}`);

  // --- Activities (homepage cards + gallery albums) ---
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

      const categoryId =
        categoryByTag[item.tagKey] ?? categoryIds[order % categoryIds.length];
      if (!categoryId) continue;

      const albumExtra = galleryAlbums[order % galleryAlbums.length];
      const photoRows: { image: number | string }[] = [];
      if (albumExtra) {
        for (const photo of albumExtra.photos) {
          const id = await ensureMedia(
            payload,
            photo,
            `${item.titleKey}-photo`,
          );
          if (id) photoRows.push({ image: id });
        }
      }

      const slug = item.id.replace(/^activity-/, "");
      const albumCopy = albumExtra
        ? en.gallery.albums[albumExtra.slug]
        : undefined;
      const albumCopyMs = albumExtra
        ? ms.gallery.albums[albumExtra.slug]
        : undefined;

      const created = await payload.create({
        collection: "activities",
        locale: "en",
        data: {
          title: en.activities.items[item.titleKey],
          slug,
          category: categoryId,
          summary: albumCopy?.summary || en.activities.description,
          description: albumCopy?.description || "",
          date: albumExtra?.date || new Date().toISOString().slice(0, 10),
          venue: albumExtra ? en.programs.venues[albumExtra.venueKey] : "",
          slot: item.slot,
          pair: pair.id,
          order,
          image: imageId,
          ...(videoId ? { video: videoId } : {}),
          photos: photoRows,
        },
      });

      await payload.update({
        collection: "activities",
        id: created.id,
        locale: "ms",
        data: {
          title: ms.activities.items[item.titleKey],
          summary: albumCopyMs?.summary || ms.activities.description,
          description: albumCopyMs?.description || "",
          venue: albumExtra ? ms.programs.venues[albumExtra.venueKey] : "",
        },
      });

      order += 1;
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
  const heroSlideRows = (
    await Promise.all(
      heroSlides.map(async (slide) => {
        const uploadSrc = slide.src.startsWith("http")
          ? "/images/hero/image1.jpg"
          : slide.src;
        const id = await ensureMedia(payload, uploadSrc, slide.alt);
        if (!id) return null;
        return {
          image: id,
          alt: slide.alt,
          ...(slide.youtubeId ? { youtubeId: slide.youtubeId } : {}),
        };
      }),
    )
  ).filter(Boolean);

  const partnerRows = (
    await Promise.all(
      defaultPartnerLogos.map(async (partner) => {
        const id = await ensureMedia(payload, partner.src, partner.alt);
        if (!id) return null;
        return {
          logo: id,
          name: partner.alt,
          ...(partner.href ? { url: partner.href } : {}),
        };
      }),
    )
  ).filter(Boolean);

  await payload.updateGlobal({
    slug: "home-hero",
    locale: "en",
    data: {
      title: heroShutterConfig.marqueeText,
      slides: heroSlideRows,
      partnersLabel: en.partners.label,
      partners: partnerRows,
    },
  });
  await payload.updateGlobal({
    slug: "home-hero",
    locale: "ms",
    data: {
      title: heroShutterConfig.marqueeText,
      slides: heroSlideRows,
      partnersLabel: ms.partners.label,
      partners: partnerRows,
    },
  });

  // Active Life collage images come from Categories — showcase global is brand copy only
  await payload.updateGlobal({
    slug: "home-showcase",
    locale: "en",
    data: { ...en.showcase },
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