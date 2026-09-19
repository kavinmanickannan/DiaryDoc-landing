/**
 * Derives the site's icons and social card from the master logo.
 *
 * brand/logo-master.png is a 2816x1536 master with a lot of empty canvas
 * around the mark. It used to sit in public/ and be rendered at 44px,
 * which cost every visitor ~4 MB; it now lives outside public/ so it is
 * never served, and this script derives the sizes the site actually uses.
 *
 *   node scripts/build-brand-assets.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "brand/logo-master.png";
const OUT = "public";

const TEAL_DEEP = "#12414f";
const TEAL = "#1f7f97";

await mkdir(OUT, { recursive: true });

/**
 * The master is an opaque near-white canvas, so trimming only crops the
 * border — the backdrop behind the mark survives as white pixels and
 * shows up as a white tile on any dark surface. Key it out by luminance.
 */
async function keyOutBackdrop(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luma > 232) {
      data[i + 3] = 0; // flat backdrop
    } else if (luma > 205) {
      // feather the antialiased rim so edges stay smooth
      data[i + 3] = Math.round(((232 - luma) / 27) * 255);
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

// Trim the flat backdrop, then sit the mark on a square with even padding.
const keyed = await keyOutBackdrop(await sharp(SRC).toBuffer());
const trimmed = await sharp(keyed).trim({ threshold: 12 }).toBuffer();
const { width, height } = await sharp(trimmed).metadata();
const side = Math.max(width, height);
const pad = Math.round(side * 0.08);
const square = await sharp(trimmed)
  .extend({
    top: Math.round((side - height) / 2) + pad,
    bottom: Math.round((side - height) / 2) + pad,
    left: Math.round((side - width) / 2) + pad,
    right: Math.round((side - width) / 2) + pad,
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .png()
  .toBuffer();

// Header / nav mark. 96px covers the 44px slot at 2x.
await sharp(square).resize(96, 96).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-mark.png`);
await sharp(square).resize(192, 192).png({ compressionLevel: 9 }).toFile(`${OUT}/icon-192.png`);
await sharp(square).resize(512, 512).png({ compressionLevel: 9 }).toFile(`${OUT}/icon-512.png`);

// Apple wants an opaque square — transparent corners render black.
await sharp(square)
  .resize(180, 180)
  .flatten({ background: "#ffffff" })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/apple-touch-icon.png`);

await sharp(square).resize(32, 32).png({ compressionLevel: 9 }).toFile(`${OUT}/favicon-32.png`);

// ── Social card ────────────────────────────────────────────────
// 1200x630. This is what a WhatsApp forward renders, so it carries the
// name, the one-line promise and the two facts that matter to a clinic.
const markForCard = await sharp(square).resize(132, 132).png().toBuffer();

const cardSvg = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${TEAL_DEEP}"/>
      <stop offset="100%" stop-color="#0c2b35"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="300" fill="${TEAL}" opacity="0.10"/>
  <circle cx="1150" cy="560" r="200" fill="${TEAL}" opacity="0.07"/>

  <text x="232" y="150" font-family="Helvetica, Arial, sans-serif" font-size="46"
        font-weight="700" fill="#ffffff" letter-spacing="-1.4">DiaryDoc<tspan fill="#5fc3dd">.</tspan></text>
  <text x="232" y="188" font-family="Helvetica, Arial, sans-serif" font-size="19"
        font-weight="600" fill="#84b6c6" letter-spacing="3">DENTAL CLINIC SOFTWARE</text>

  <text x="86" y="330" font-family="Helvetica, Arial, sans-serif" font-size="70"
        font-weight="700" fill="#ffffff" letter-spacing="-2.6">Your dental clinic,</text>
  <text x="86" y="412" font-family="Helvetica, Arial, sans-serif" font-size="70"
        font-weight="700" fill="#5fc3dd" letter-spacing="-2.6">connected.</text>

  <text x="86" y="472" font-family="Helvetica, Arial, sans-serif" font-size="27"
        fill="#b3cfd9">Charting, records, treatment plans and GST billing —</text>
  <text x="86" y="510" font-family="Helvetica, Arial, sans-serif" font-size="27"
        fill="#b3cfd9">running in your clinic, with or without the internet.</text>

  <rect x="86" y="552" width="228" height="44" rx="22" fill="#ffffff" opacity="0.10"/>
  <text x="110" y="580" font-family="Helvetica, Arial, sans-serif" font-size="19"
        font-weight="600" fill="#cfe6ee">Works offline</text>
  <rect x="330" y="552" width="250" height="44" rx="22" fill="#ffffff" opacity="0.10"/>
  <text x="354" y="580" font-family="Helvetica, Arial, sans-serif" font-size="19"
        font-weight="600" fill="#cfe6ee">DPDP &amp; ABDM ready</text>
  <rect x="596" y="552" width="212" height="44" rx="22" fill="#ffffff" opacity="0.10"/>
  <text x="620" y="580" font-family="Helvetica, Arial, sans-serif" font-size="19"
        font-weight="600" fill="#cfe6ee">Built in India</text>
</svg>
`);

await sharp(cardSvg)
  .composite([{ input: markForCard, top: 62, left: 86 }])
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/og-image.png`);

console.log("brand assets written to public/");
