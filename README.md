# Persatuan Sukan & Rekreasi (PSR) website

Next.js App Router site with an embedded [Payload CMS 3](https://payloadcms.com/) admin at `/admin`.

## Getting started

```bash
cp .env.example .env.local
# set PAYLOAD_SECRET to a long random string
npm install
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- CMS: [http://localhost:3000/admin](http://localhost:3000/admin) — create the first admin user on first visit

Without `POSTGRES_URL`, Payload uses local SQLite (`./payload.db`). Without `BLOB_READ_WRITE_TOKEN`, media uploads are stored under `./media`.

### Seed CMS from existing content

```bash
npm run cms:seed
```

Imports programs, gallery albums, activities, committee, and homepage/about/contact globals (EN + MS) from the current config/dictionary files. Local media is uploaded into Payload Media (disk `./media`, or Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set).

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js + Payload |
| `npm run build` | `payload migrate` then `next build` |
| `npm run payload` | Payload CLI |
| `npm run payload:types` | Generate `src/payload-types.ts` |
| `npm run payload:importmap` | Regenerate admin import map |
| `npm run cms:seed` | Seed collections/globals |

## Content model (v1)

Admin sidebar is grouped by page. Each entry is a section of that page:

| Page group | Sections |
| --- | --- |
| **01 — Home** | Active Life Showcase · Impact Section · Programs Labels · Upcoming Programs · Activities Section · Activity Cards |
| **02 — About Us** | About Page Copy · Committee Members |
| **03 — Gallery** | Gallery Labels · Photo Albums |
| **04 — Contact** | Contact Page Copy |
| **05 — Site** | Site Settings · Media Library · Admin Users |

Localized fields use Payload locales `en` and `ms`. Navigation structure and form submission APIs stay in code for a later phase.

## Deploy on Vercel

1. **Create stores**
   - Vercel Postgres (or Neon) → copy connection string to `POSTGRES_URL`
   - Vercel Blob → copy `BLOB_READ_WRITE_TOKEN`
2. **Environment variables** (Project → Settings → Environment Variables)
   - `PAYLOAD_SECRET` — long random string (required)
   - `POSTGRES_URL` — Postgres connection string (required in production)
   - `BLOB_READ_WRITE_TOKEN` — Blob read/write token (required for production media)
   - `NEXT_PUBLIC_SITE_URL` — production URL
3. **Build** — `npm run build` already runs `payload migrate` before `next build`
4. **Smoke test**
   - Open `/admin`, create/login as admin
   - Edit a program title → confirm the homepage programs table updates (cache revalidates via Payload hooks)
5. **Optional:** run `npm run cms:seed` once against production (with env vars set locally pointing at prod DB/Blob) to import starter content

Do not commit `.env.local`, `payload.db`, or `/media`.
