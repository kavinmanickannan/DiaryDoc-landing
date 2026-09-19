# DiaryDoc landing page

A separate Sites marketing page for the DiaryDoc dental clinic application. It uses the supplied logo, a simplified interactive version of the product odontogram, product capabilities verified against the application, pilot application capture, FAQs and an application privacy notice.

Pilot applications are stored in the Sites D1 table `pilot_applications`; there is no public read endpoint. The owner can review entries through Sites database tools. Contact and deletion requests need team review; no automatic emails are sent.

The odontogram is a transient browser demo with sample data. It never reads or writes clinical records. Public launch requires changing the Site audience; the initial publication is owner-private.

Pilot pricing, duration, capacity and service terms are intentionally not promised. DICOM viewing, automated messaging, online payments and a hosted SaaS offering are not advertised as connected features.

## Brand and product-tour assets

Both are generated, not hand-edited. They need `sharp` (`npm i -D sharp`).

| Command | Output |
|---|---|
| `node scripts/build-brand-assets.mjs` | `public/logo-mark.png`, the favicon/app icons and `public/og-image.png`, all derived from `brand/logo-master.png` |
| `node scripts/build-tour-images.mjs [sourceDir]` | `public/tour/*.{webp,png}` for the product-tour section |

`brand/logo-master.png` sits outside `public/` on purpose: it is a 4 MB master that must never be served. Re-run the brand script after changing it.

The tour images are captures of a real DiaryDoc instance running on demo data, not mockups. To refresh them, run DiaryDoc locally with demo records, capture `dashboard`, `invoice` and `kiosk` to a directory, then point `build-tour-images.mjs` at it.

### Social card

`metadataBase` in `app/layout.tsx` resolves the Open Graph image to an absolute URL. Next bakes this in **at build time**, so set `NEXT_PUBLIC_SITE_URL` to the production domain in the deployment's build environment — otherwise shared links fall back to `localhost` and render no preview. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used automatically when that variable is absent.

## Local checks

| Command | What it does |
|---|---|
| `node scripts/preview-shots.mjs [baseUrl]` | Renders desktop and mobile screenshots of the page |
| `node scripts/check.mjs [baseUrl]` | Flags horizontal overflow at phone width |

Both need `playwright` (`npm i -D playwright`) and a running dev or production server.
