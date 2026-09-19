/**
 * Turns raw app captures into the web assets the product tour uses.
 *
 * The captures come from a local DiaryDoc instance running on demo data
 * (see the tour section in app/page.tsx). Source files live outside the
 * repo; pass a directory as argv[2], default /tmp/claude-0/shots.
 *
 *   node scripts/build-tour-images.mjs [sourceDir]
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = process.argv[2] ?? "/tmp/claude-0/shots";
const OUT = "public/tour";
await mkdir(OUT, { recursive: true });

// Captures are 2x. Crops below are in capture pixels.
const JOBS = [
  {
    // Owner dashboard. The sidebar stays in frame on purpose — the module
    // list is itself the argument that this covers the whole practice.
    in: "dashboard.png",
    out: "dashboard",
    extract: { left: 0, top: 0, width: 3000, height: 1700 },
    width: 1500,
  },
  {
    // Tax invoice — the whole printable document including the UPI QR.
    // cropTop drops the on-screen "back / print" toolbar, which is
    // print:hidden in the app and has no place in a product shot.
    in: "invoice.png",
    out: "invoice",
    cropTop: 76,
    width: 1200,
  },
  {
    // Waiting-room screen — full bleed, it is already a display surface.
    in: "kiosk.png",
    out: "kiosk",
    width: 1400,
  },
];

for (const job of JOBS) {
  let img = sharp(`${SRC}/${job.in}`);
  if (job.cropTop) {
    const { width, height } = await img.metadata();
    img = img.extract({ left: 0, top: job.cropTop, width, height: height - job.cropTop });
  }
  if (job.extract) img = img.extract(job.extract);
  const base = img.resize({ width: job.width, withoutEnlargement: true });

  await base.clone().webp({ quality: 82 }).toFile(`${OUT}/${job.out}.webp`);
  await base.clone().png({ compressionLevel: 9 }).toFile(`${OUT}/${job.out}.png`);

  const meta = await sharp(`${OUT}/${job.out}.png`).metadata();
  console.log(`${job.out}: ${meta.width}x${meta.height}`);
}

console.log("tour images written to public/tour/");
